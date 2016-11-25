var nodemailer = require('nodemailer');
var credentials = require('../config/credentials');

exports.challengeNotification = function (challenge, host) {
  var opponentEmail = challenge.opponent.email;
  // Send all emails to knifeplane admin email in dev enironment
  if (process.env.NODE_ENV === 'development') {
    opponentEmail = 'knifeplaneapp@gmail.com';
  }

  var challenger = challenge.challenger.firstName + ' ' + challenge.challenger.lastName;
  var competitionName = challenge.competitionName;
  var timeLimit = '';
  if (challenge.timeLimit) {
    timeLimit = '<p>You have <b>' + (challenge.timeLimit * 24) + ' hours</b> to complete the challenge.</p>';
  }
  var details = 'You can view the challenge and post the result at <a href="http://' + host + '/pyramids/view/' + challenge.competitionId + '">Knifeplane</a>';
  var tagLine = '<i><b>Knifeplane</b> - Fight your way to the top!</i>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="60" border="0" alt="DigitalOcean Logo" style="display:block;border:none;outline:none;text-decoration:none" src="https://ci6.googleusercontent.com/proxy/_gqL3vU4z5GEYaahWsV-4TEfmlIIBR8em3qxgxfs3-p9rgfNQalirM9Iiz4vwFWc8VzL8k8EpyIp59_ARQ7-mdr67MkQVpdAL0ZGtofdFTcNrGUGolAHIQ=s0-d-e1-ft#http://go.digitalocean.com/rs/937-EID-756/images/email_logo-sm.png" class="CToWUd"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#444444;text-align:center;line-height:55px;font-weight:100"> <p>You\'ve been challenged!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" class="m_-5388659714437924733devicewidth"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px"><strong>' + challenger + '</strong></p> <p>has challenged you in: <strong> ' + competitionName + '</strong></p> <p> <br> </p> ' + timeLimit + ' <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var transporter = nodemailer.createTransport(credentials.smtp);

  var mailOptions = {
    from: '"Knife Plane" <knifeplaneapp@gmail.com>', // sender address
    to: opponentEmail, // list of receivers
    subject: 'Knifeplane Challenge', // Subject line
    text: 'You have been challenged', // plaintext body
    html: msg // html body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};