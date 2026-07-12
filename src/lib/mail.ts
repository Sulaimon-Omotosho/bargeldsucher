import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// export async function sendEmail({
//   to,
//   subject,
//   html,
// }: {
//   to: string
//   subject: string
//   html: string
// }) {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Bargeldsucher" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     })

//     console.log('Email sent:', info.messageId)
//   } catch (error) {
//     console.error('Email error:', error)
//     throw error
//   }
// }
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  await transporter.sendMail({
    from: `"Bargeldsucher" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  })
}
