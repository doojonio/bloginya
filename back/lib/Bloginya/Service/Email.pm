package Bloginya::Service::Email;
use Mojo::Base 'Bloginya::Plugin::Service::Base', -signatures, -async_await;
use Bloginya::Plugin::Service::Util;

use Mojo::IOLoop;
use Mojo::Promise;

inject 'app';
inject 'config';
inject 'db';
inject 'log';
inject 'metrics';

service se_post => 'post';

has 'backend' => sub ($self) {
  my $backend_type = $self->config->{smtp}{backend} || 'smtp';

  if ($backend_type eq 'file') {
    require Bloginya::Service::Email::Backend::File;
    return Bloginya::Service::Email::Backend::File->new(
      config => $self->config,
      log    => $self->log,
    );
  }
  else {
    require Bloginya::Service::Email::Backend::SMTP;
    return Bloginya::Service::Email::Backend::SMTP->new(
      config => $self->config,
      log    => $self->log,
    );
  }
};

async sub send_new_post_notification_p ($self, $post_id) {
  $self->log->info("Sending email notifications for post $post_id");

  my $post = await $self->se_post->read_p($post_id);
  unless ($post) {
    $self->log->error("Post $post_id not found, cannot send notifications");
    return;
  }

  my $subscribers = await $self->_get_subscribers_p();

  unless (@$subscribers) {
    $self->log->info("No subscribers found, skipping email notifications");
    return;
  }

  $self->log->info(sprintf("Sending notifications to %d subscribers", scalar @$subscribers));

  await $self->_send_with_rate_limit_p($post, $subscribers);

  $self->log->info("Completed sending email notifications for post $post_id");
}

async sub _get_subscribers_p ($self) {
  my $res = await $self->db->select_p(
    [\'subscribers s', [\'users u', 'u.id' => 's.user_id']],
    ['u.email', 's.user_id', 's.unsubscribe_secret'],
    {'s.subscribed' => 1, 'u.status' => 'active'},
  );

  return $res->hashes;
}

async sub _send_with_rate_limit_p ($self, $post, $subscribers) {
  my $rate_limit = $self->config->{smtp}{rate_limit} || 10;
  my $delay = 60 / $rate_limit;

  my $promise = Mojo::Promise->new;
  my @queue = @$subscribers;
  my $errors = 0;

  my $send_next;
  $send_next = sub {
    return $promise->resolve unless @queue;

    my $subscriber = shift @queue;
    my $unsubscribe_url = $self->_get_unsubscribe_url($subscriber->{unsubscribe_secret});

    eval {
      my $html = $self->_build_html_email($post, $unsubscribe_url);
      my $text = $self->_build_text_email($post, $unsubscribe_url);

      $self->backend->send_email(
        $subscriber->{email},
        sprintf('New Post: %s', $post->{title}),
        $html,
        $text,
      );
    };

    if ($@) {
      $errors++;
      $self->log->error("Failed to send email to $subscriber->{email}: $@");
      $self->metrics->inc('bloginya_email_notification_errors_total');
    }
    else {
      $self->metrics->inc('bloginya_email_notifications_sent_total');
    }

    if (@queue) {
      Mojo::IOLoop->timer($delay => $send_next);
    }
    else {
      $promise->resolve;
    }
  };

  $send_next->();

  await $promise;

  if ($errors) {
    $self->log->warn("Completed with $errors errors");
  }
}

sub _build_html_email ($self, $post, $unsubscribe_url) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = $post->{name}
    ? sprintf('%s/%s', $site_url, $post->{name})
    : sprintf('%s/p/%s', $site_url, $post->{id});

  my $picture_html = '';
  if ($post->{picture_pre}) {
    my $picture_url = sprintf('%s/%s?d=medium', $site_url, $post->{picture_pre});
    $picture_html = qq{
      <tr>
        <td style="padding: 0;">
          <img src="$picture_url" alt="Post image" style="width: 100%; max-width: 600px; height: auto; display: block;">
        </td>
      </tr>
    };
  }

  return qq{
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Post: $post->{title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f0ef;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0ef; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #ac2473 0%, #FF6AB7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">$site_name</h1>
            </td>
          </tr>
          $picture_html
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1c1b1b; font-size: 28px; line-height: 1.3; font-weight: 600;">$post->{title}</h2>
              <p style="margin: 0 0 30px 0; color: #474746; font-size: 16px; line-height: 1.6;">$post->{description}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="$post_url" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #FF6AB7 0%, #ff81be 100%); color: #ffffff; text-decoration: none; border-radius: 28px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 106, 183, 0.3);">Read Full Post</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fff8f8; padding: 24px 30px; text-align: center; border-top: 1px solid #f9dbe5;">
              <p style="margin: 0 0 12px 0; color: #624d55; font-size: 14px;">
                You're receiving this because you're subscribed to $site_name
              </p>
              <p style="margin: 0; color: #89717a; font-size: 12px;">
                <a href="$unsubscribe_url" style="color: #ac2473; text-decoration: none; font-weight: 500;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  };
}

sub _build_text_email ($self, $post, $unsubscribe_url) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = sprintf('%s/p/%s', $site_url, $post->{name} || $post->{id});

  return qq{
New Post on $site_name

$post->{title}

$post->{description}

Read the full post: $post_url

---
You're receiving this because you're subscribed to $site_name.
To unsubscribe, visit: $unsubscribe_url
  };
}

async sub send_comment_notification_p ($self, $post_id, $comment_id, $user_id) {
  $self->log->info("Sending comment notification for post $post_id, comment $comment_id");

  my $post = await $self->se_post->read_p($post_id);
  unless ($post) {
    $self->log->error("Post $post_id not found, cannot send comment notification");
    return;
  }

  my $comment = (await $self->db->select_p('comments', ['content', 'created_at'], {id => $comment_id}))->hashes->first;
  unless ($comment) {
    $self->log->error("Comment $comment_id not found, cannot send comment notification");
    return;
  }

  my $user = (await $self->db->select_p('users', ['username', 'email'], {id => $user_id}))->hashes->first;
  unless ($user) {
    $self->log->error("User $user_id not found, cannot send comment notification");
    return;
  }

  my $owners = await $self->_get_post_owners_p($post_id);

  unless (@$owners) {
    $self->log->info("No owners found for post $post_id, skipping comment notification");
    return;
  }

  $self->log->info(sprintf("Sending comment notification to %d owners", scalar @$owners));

  await $self->_send_comment_notifications_p($post, $comment, $user, $owners);

  $self->log->info("Completed sending comment notification for post $post_id");
}

async sub send_like_notification_p ($self, $post_id, $liker_user_id) {
  $self->log->info("Sending like notification for post $post_id");

  my $post = await $self->se_post->read_p($post_id);
  unless ($post) {
    $self->log->error("Post $post_id not found, cannot send like notification");
    return;
  }

  my $liker = (await $self->db->select_p('users', ['username', 'email'], {id => $liker_user_id}))->hashes->first;
  unless ($liker) {
    $self->log->error("User $liker_user_id not found, cannot send like notification");
    return;
  }

  my $owners = await $self->_get_post_owners_p($post_id);

  unless (@$owners) {
    $self->log->info("No owners found for post $post_id, skipping like notification");
    return;
  }

  $self->log->info(sprintf("Sending like notification to %d owners", scalar @$owners));

  await $self->_send_like_notifications_p($post, $liker, $owners);

  $self->log->info("Completed sending like notification for post $post_id");
}

async sub _get_post_owners_p ($self, $post_id) {
  my $post = (await $self->db->select_p('posts', ['user_id'], {id => $post_id}))->hashes->first;
  return [] unless $post;

  my $post_author_id = $post->{user_id};

  my $res = await $self->db->select_p(
    'users',
    ['id', 'email', 'username'],
    {
      -or => [
        id => $post_author_id,
        role => 'owner'
      ],
      status => 'active'
    }
  );

  return $res->hashes;
}

async sub _send_comment_notifications_p ($self, $post, $comment, $user, $owners) {
  my $rate_limit = $self->config->{smtp}{rate_limit} || 10;
  my $delay = 60 / $rate_limit;

  my $promise = Mojo::Promise->new;
  my @queue = @$owners;
  my $errors = 0;

  my $send_next;
  $send_next = sub {
    return $promise->resolve unless @queue;

    my $owner = shift @queue;

    eval {
      my $html = $self->_build_comment_html_email($post, $comment, $user);
      my $text = $self->_build_comment_text_email($post, $comment, $user);

      $self->backend->send_email(
        $owner->{email},
        sprintf('New Comment on: %s', $post->{title}),
        $html,
        $text,
      );
    };

    if ($@) {
      $errors++;
      $self->log->error("Failed to send comment notification email to $owner->{email}: $@");
      $self->metrics->inc('bloginya_email_notification_errors_total');
    }
    else {
      $self->metrics->inc('bloginya_email_notifications_sent_total');
    }

    if (@queue) {
      Mojo::IOLoop->timer($delay => $send_next);
    }
    else {
      $promise->resolve;
    }
  };

  $send_next->();

  await $promise;

  if ($errors) {
    $self->log->warn("Completed comment notifications with $errors errors");
  }
}

async sub _send_like_notifications_p ($self, $post, $liker, $owners) {
  my $rate_limit = $self->config->{smtp}{rate_limit} || 10;
  my $delay = 60 / $rate_limit;

  my $promise = Mojo::Promise->new;
  my @queue = @$owners;
  my $errors = 0;

  my $send_next;
  $send_next = sub {
    return $promise->resolve unless @queue;

    my $owner = shift @queue;

    eval {
      my $html = $self->_build_like_html_email($post, $liker);
      my $text = $self->_build_like_text_email($post, $liker);

      $self->backend->send_email(
        $owner->{email},
        sprintf('New Like on: %s', $post->{title}),
        $html,
        $text,
      );
    };

    if ($@) {
      $errors++;
      $self->log->error("Failed to send like notification email to $owner->{email}: $@");
      $self->metrics->inc('bloginya_email_notification_errors_total');
    }
    else {
      $self->metrics->inc('bloginya_email_notifications_sent_total');
    }

    if (@queue) {
      Mojo::IOLoop->timer($delay => $send_next);
    }
    else {
      $promise->resolve;
    }
  };

  $send_next->();

  await $promise;

  if ($errors) {
    $self->log->warn("Completed like notifications with $errors errors");
  }
}

sub _build_comment_html_email ($self, $post, $comment, $user) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = $post->{name}
    ? sprintf('%s/%s', $site_url, $post->{name})
    : sprintf('%s/p/%s', $site_url, $post->{id});

  my $comment_content = $comment->{content} || '';
  $comment_content =~ s/&/&amp;/g;
  $comment_content =~ s/</&lt;/g;
  $comment_content =~ s/>/&gt;/g;
  $comment_content =~ s/\n/<br>/g;

  return qq{
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment on: $post->{title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f0ef;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0ef; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #ac2473 0%, #FF6AB7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">$site_name</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1c1b1b; font-size: 28px; line-height: 1.3; font-weight: 600;">New Comment on Your Post</h2>
              <p style="margin: 0 0 20px 0; color: #474746; font-size: 16px; line-height: 1.6;">
                <strong>$user->{username}</strong> commented on your post:
              </p>
              <h3 style="margin: 0 0 15px 0; color: #1c1b1b; font-size: 22px; line-height: 1.3; font-weight: 600;">$post->{title}</h3>
              <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #FF6AB7;">
                <p style="margin: 0; color: #474746; font-size: 15px; line-height: 1.6;">$comment_content</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="$post_url" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #FF6AB7 0%, #ff81be 100%); color: #ffffff; text-decoration: none; border-radius: 28px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 106, 183, 0.3);">View Post & Reply</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fff8f8; padding: 24px 30px; text-align: center; border-top: 1px solid #f9dbe5;">
              <p style="margin: 0; color: #89717a; font-size: 12px;">
                You're receiving this because you're an owner of this post on $site_name
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  };
}

sub _build_comment_text_email ($self, $post, $comment, $user) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = sprintf('%s/p/%s', $site_url, $post->{name} || $post->{id});

  return qq{
New Comment on Your Post - $site_name

$user->{username} commented on your post:

$post->{title}

Comment:
$comment->{content}

View the post and reply: $post_url

---
You're receiving this because you're an owner of this post on $site_name.
  };
}

sub _build_like_html_email ($self, $post, $liker) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = $post->{name}
    ? sprintf('%s/%s', $site_url, $post->{name})
    : sprintf('%s/p/%s', $site_url, $post->{id});

  return qq{
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Like on: $post->{title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f0ef;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0ef; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #ac2473 0%, #FF6AB7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">$site_name</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1c1b1b; font-size: 28px; line-height: 1.3; font-weight: 600;">New Like on Your Post</h2>
              <p style="margin: 0 0 20px 0; color: #474746; font-size: 16px; line-height: 1.6;">
                <strong>$liker->{username}</strong> liked your post:
              </p>
              <h3 style="margin: 0 0 30px 0; color: #1c1b1b; font-size: 22px; line-height: 1.3; font-weight: 600;">$post->{title}</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="$post_url" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #FF6AB7 0%, #ff81be 100%); color: #ffffff; text-decoration: none; border-radius: 28px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 106, 183, 0.3);">View Post</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fff8f8; padding: 24px 30px; text-align: center; border-top: 1px solid #f9dbe5;">
              <p style="margin: 0; color: #89717a; font-size: 12px;">
                You're receiving this because you're an owner of this post on $site_name
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  };
}

sub _build_like_text_email ($self, $post, $liker) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = sprintf('%s/p/%s', $site_url, $post->{name} || $post->{id});

  return qq{
New Like on Your Post - $site_name

$liker->{username} liked your post:

$post->{title}

View the post: $post_url

---
You're receiving this because you're an owner of this post on $site_name.
  };
}

async sub send_reply_notification_p ($self, $post_id, $parent_comment_id, $reply_comment_id, $user_id) {
  $self->log->info("Sending reply notification for post $post_id, parent comment $parent_comment_id");

  my $post = await $self->se_post->read_p($post_id);
  unless ($post) {
    $self->log->error("Post $post_id not found, cannot send reply notification");
    return;
  }

  my $parent_comment = (await $self->db->select_p('comments', ['user_id', 'content'], {id => $parent_comment_id}))->hashes->first;
  unless ($parent_comment) {
    $self->log->error("Parent comment $parent_comment_id not found, cannot send reply notification");
    return;
  }

  my $reply_comment = (await $self->db->select_p('comments', ['content', 'created_at'], {id => $reply_comment_id}))->hashes->first;
  unless ($reply_comment) {
    $self->log->error("Reply comment $reply_comment_id not found, cannot send reply notification");
    return;
  }

  my $replier = (await $self->db->select_p('users', ['username', 'email'], {id => $user_id}))->hashes->first;
  unless ($replier) {
    $self->log->error("User $user_id not found, cannot send reply notification");
    return;
  }

  # Check if parent comment author is subscribed
  my $parent_user = await $self->_get_subscribed_user_p($parent_comment->{user_id});
  unless ($parent_user) {
    $self->log->info("Parent comment author $parent_comment->{user_id} is not subscribed, skipping reply notification");
    return;
  }

  $self->log->info("Sending reply notification to $parent_user->{email}");

  await $self->_send_reply_notification_p($post, $parent_comment, $reply_comment, $replier, $parent_user);

  $self->log->info("Completed sending reply notification for post $post_id");
}

async sub _get_subscribed_user_p ($self, $user_id) {
  my $res = await $self->db->select_p(
    [\'subscribers s', [\'users u', 'u.id' => 's.user_id']],
    ['u.id', 'u.email', 'u.username', 's.unsubscribe_secret'],
    {'s.user_id' => $user_id, 's.subscribed' => 1, 'u.status' => 'active'}
  );

  return $res->hashes->first;
}

async sub _send_reply_notification_p ($self, $post, $parent_comment, $reply_comment, $replier, $parent_user) {
  my $unsubscribe_url = $parent_user->{unsubscribe_secret} ? $self->_get_unsubscribe_url($parent_user->{unsubscribe_secret}) : undef;

  eval {
    my $html = $self->_build_reply_html_email($post, $parent_comment, $reply_comment, $replier, $unsubscribe_url);
    my $text = $self->_build_reply_text_email($post, $parent_comment, $reply_comment, $replier, $unsubscribe_url);

    $self->backend->send_email(
      $parent_user->{email},
      sprintf('New Reply to Your Comment on: %s', $post->{title}),
      $html,
      $text,
    );
  };

  if ($@) {
    $self->log->error("Failed to send reply notification email to $parent_user->{email}: $@");
    $self->metrics->inc('bloginya_email_notification_errors_total');
  }
  else {
    $self->metrics->inc('bloginya_email_notifications_sent_total');
  }
}

sub _build_reply_html_email ($self, $post, $parent_comment, $reply_comment, $replier, $unsubscribe_url = undef) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = $post->{name}
    ? sprintf('%s/%s', $site_url, $post->{name})
    : sprintf('%s/p/%s', $site_url, $post->{id});

  my $parent_content = $parent_comment->{content} || '';
  $parent_content =~ s/&/&amp;/g;
  $parent_content =~ s/</&lt;/g;
  $parent_content =~ s/>/&gt;/g;
  $parent_content =~ s/\n/<br>/g;

  my $reply_content = $reply_comment->{content} || '';
  $reply_content =~ s/&/&amp;/g;
  $reply_content =~ s/</&lt;/g;
  $reply_content =~ s/>/&gt;/g;
  $reply_content =~ s/\n/<br>/g;

  my $footer_html = qq{
              <p style="margin: 0; color: #89717a; font-size: 12px;">
                You're receiving this because you're subscribed to notifications on $site_name
              </p>};

  if ($unsubscribe_url) {
    $footer_html .= qq{
              <p style="margin: 5px 0 0 0; color: #89717a; font-size: 12px;">
                <a href="$unsubscribe_url" style="color: #ac2473; text-decoration: none; font-weight: 500;">Unsubscribe</a>
              </p>};
  }

  return qq{
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Reply to Your Comment on: $post->{title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f0ef;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0ef; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #ac2473 0%, #FF6AB7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">$site_name</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1c1b1b; font-size: 28px; line-height: 1.3; font-weight: 600;">New Reply to Your Comment</h2>
              <p style="margin: 0 0 20px 0; color: #474746; font-size: 16px; line-height: 1.6;">
                <strong>$replier->{username}</strong> replied to your comment on:
              </p>
              <h3 style="margin: 0 0 15px 0; color: #1c1b1b; font-size: 22px; line-height: 1.3; font-weight: 600;">$post->{title}</h3>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ccc;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Your Comment:</p>
                <p style="margin: 0; color: #474746; font-size: 14px; line-height: 1.5;">$parent_content</p>
              </div>
              <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #FF6AB7;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Reply:</p>
                <p style="margin: 0; color: #474746; font-size: 15px; line-height: 1.6;">$reply_content</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="$post_url" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #FF6AB7 0%, #ff81be 100%); color: #ffffff; text-decoration: none; border-radius: 28px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 106, 183, 0.3);">View Post & Reply</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fff8f8; padding: 24px 30px; text-align: center; border-top: 1px solid #f9dbe5;">
$footer_html
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  };
}

sub _build_reply_text_email ($self, $post, $parent_comment, $reply_comment, $replier, $unsubscribe_url = undef) {
  my $site_url = $self->config->{site_url};
  my $site_name = $self->config->{site_name};
  my $post_url = sprintf('%s/p/%s', $site_url, $post->{name} || $post->{id});

  my $footer_text = qq{
---
You're receiving this because you're subscribed to notifications on $site_name.};

  if ($unsubscribe_url) {
    $footer_text .= qq{
To unsubscribe, visit: $unsubscribe_url};
  }

  return qq{
New Reply to Your Comment - $site_name

$replier->{username} replied to your comment on:

$post->{title}

Your Comment:
$parent_comment->{content}

Reply:
$reply_comment->{content}

View the post and reply: $post_url

$footer_text
  };
}

sub _get_unsubscribe_url ($self, $secret) {
  my $site_url = $self->config->{site_url};
  return sprintf('%s/api/subscription/unsubscribe/%s', $site_url, $secret);
}

1;
