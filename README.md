# email-cli

Connect your gmail account to this CLI tool to send emails from the command line. Currently only works for google [app
passwords](https://support.google.com/mail/answer/185833?hl=en) (oauth to come soon).

## Usage

Use `email-cli --help` to see all options.

### Config

Use `email-cli config` to enter credentials.
`-v` shows current credentials.

### Send emails

Use `email-cli send -m <message> -s <subject> -r <recipients> -f <from>` to send an email.