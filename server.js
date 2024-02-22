require('dotenv').config()
const Imap = require('imap')
const fs = require('fs')
const { simpleParser } = require('mailparser')

const imap = new Imap({
  user: process.env.EMAIL,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
})

imap.once('ready', function () {
  console.log('Connected to IMAP server')

  imap.openBox('INBOX', true, function (err, box) {
    if (err) throw err

    if (err) throw err
    const f = imap.seq.fetch('1:*', {
      // You can change this range
      bodies: '',
      struct: true,
    })
    f.on('message', function (msg, seqno) {
      console.log('Message #%d', seqno)
      let buffer = ''
      msg.on('body', function (stream, info) {
        stream.on('data', function (chunk) {
          buffer += chunk.toString('utf8')
        })
      })
      msg.once('attributes', function (attrs) {
        simpleParser(buffer, (err, mail) => {
          if (err) throw err
          console.log('Email Parsed', {
            from: mail.from.text,
            subject: mail.subject,
            body: mail.text,
            date: mail.date,
          })
        })
      })
    })
    f.once('error', function (err) {
      console.log('Fetch error: ' + err)
    })
    f.once('end', function () {
      console.log('Done fetching all messages!')
      imap.end()
    })
  })
})

imap.once('error', function (err) {
  console.log(err)
})

imap.once('end', function () {
  console.log('Connection ended')
})

imap.connect()
