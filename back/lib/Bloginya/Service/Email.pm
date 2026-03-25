package Bloginya::Service::Email;
use Mojo::Base 'Bloginya::Plugin::Service::Base', -signatures, -async_await;
use Bloginya::Plugin::Service::Util;

use Mojo::IOLoop;
use Mojo::Promise;

inject 'app';
inject 'config';
inject 'db';
inject 'log';

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

sub _get_unsubscribe_url ($self, $secret) {
  my $site_url = $self->config->{site_url};
  return sprintf('%s/api/subscription/unsubscribe/%s', $site_url, $secret);
}

1;
