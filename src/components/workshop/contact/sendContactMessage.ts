type ContactMessage = { name: string; email: string; message: string }

// These are the same browser-facing EmailJS settings used by the original form.
const emailSettings = {
  publicKey: 'U-r5XsJ_RAo2elvRv',
  service: 'service_oqeswp6',
  template: 'template_c8l3l9a',
}

export async function sendContactMessage({ name, email, message }: ContactMessage) {
  const { default: emailjs } = await import('@emailjs/browser')
  return emailjs.send(emailSettings.service, emailSettings.template, {
    from_name: name,
    from_email: email,
    message,
  }, { publicKey: emailSettings.publicKey })
}
