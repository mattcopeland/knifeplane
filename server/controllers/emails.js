var nodemailer = require('nodemailer');
var credentials = require('../config/credentials');
var _ = require('lodash');

var logo = 'http://wannaplay.me/images/wpm-logo-blue.png';
var tagLine = '<i><b>WannaPlayMe</b> - Make your way to the top!</i>';
var fromEmail = '"WannaPlayMe" <wannaplaymeapp@gmail.com>';

// Player has requested to join a competition
exports.addPlayerRequest = function(competition, player, host) {
  var emails = [];
  _.forEach(competition.admins, function (admin) {
    emails.push(admin.email);
  });
  var email = emails.join();

  if (process.env.NODE_ENV === 'development') {
    email = 'wannaplaymeapp@gmail.com';
  }

  var joiner = player.firstName + ' ' + player.lastName;

  var handle = '<a href="http://' + host + '/competitions/admin/' + competition._id + '">Handle Request</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Join Request</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px"><strong>' + joiner + '</strong></p> <p>has requested to join: <strong> ' + competition.name + '</strong></p> <p> <br> </p> <p>' + handle + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: fromEmail, // sender address
    to: email, // list of receivers
    subject: 'WannaPlayMe Join Request', // Subject line
    text: player.firstName + ' ' + player.lastName + ' has requested to join ' + competition.name, // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

// Player's request to join a competition has been approved
exports.approveRequest = function(competitionId, competitionName, player, host) {
  var email = player.email;

  if (process.env.NODE_ENV === 'development') {
    email = 'wannaplaymeapp@gmail.com';
  }

  var details = '<a href="http://' + host + '/competitions/view/' + competitionId + '">View the competition</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Request Approved!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p> Your request to join <strong>' + competitionName + '</strong> has been approved</p> <p> <br> </p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: fromEmail, // sender address
    to: email, // list of receivers
    subject: 'WannaPlayMe Join Request Approved', // Subject line
    text: 'Your request to join ' + competitionName + ' has been approved.', // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

// Player's request to join a competition has been denied
exports.denyRequest = function(competitionId, competitionName, player, host) {
  var email = player.email;

  if (process.env.NODE_ENV === 'development') {
    email = 'wannaplaymeapp@gmail.com';
  }

  var details = 'You can still <a href="http://' + host + '/competitions/view/' + competitionId + '">view the competition</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Request Denied :(</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p> Your request to join <strong>' + competitionName + '</strong> has been denied.</p> <p> <br> </p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: fromEmail, // sender address
    to: email, // list of receivers
    subject: 'WannaPlayMe Join Request Denied', // Subject line
    text: 'Your request to join ' + competitionName + ' has been approved.', // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

exports.userVerification = function(user, host) {
  var email = user.username;
  // Send all emails to WannaPlayMe admin email in dev enironment
  if (process.env.NODE_ENV === 'development') {
    email = 'wannaplaymeapp@gmail.com';
  }

  var details = 'Please verify your account by clicking on the link below<br /><a href="http://' + host + '/verification/' + user._id + '/' + user.verificationToken + '">http://' + host + '/verification/' + user._id + '/' + user.verificationToken + '</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Welcome to WannaPlayMe!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px">Welcome <strong>' + user.firstName + ' ' + user.lastName + '</strong></p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: fromEmail, // sender address
    to: email, // list of receivers
    subject: 'WannaPlayMe Verification', // Subject line
    text: 'Please verify your account at http://' + host + '/verification/' + user._id + '/' + user.verificationToken, // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

exports.challengeNotification = function (challenge, host) {
  var opponentEmail = challenge.opponent.email;
  // Send all emails to WannaPlayMe admin email in dev enironment
  if (process.env.NODE_ENV === 'development') {
    opponentEmail = 'wannaplaymeapp@gmail.com';
  }

  var challenger = challenge.challenger.displayName;
  var competitionName = challenge.competitionName;
  var timeLimit = '';
  if (challenge.timeLimit) {
    timeLimit = '<p>You have <b>' + (challenge.timeLimit * 24) + ' hours</b> to complete the challenge.</p>';
  }
  var details = 'You can view the challenge and post the result at <a href="http://' + host + '/competitions/view/' + challenge.competitionId + '">WannaPlayMe</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>You\'ve been challenged!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px"><strong>' + challenger + '</strong></p> <p>has challenged you in:<p> <p><strong> ' + competitionName + '</strong></p> <p> <br> </p> ' + timeLimit + ' <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: fromEmail, // sender address
    to: opponentEmail, // list of receivers
    subject: 'WannaPlayMe Challenge', // Subject line
    text: 'You have been challenged', // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

exports.passwordReset = function(user, verificationToken, host) {
  var email = user.username;
  // Send all emails to WannaPlayMe admin email in dev enironment
  if (process.env.NODE_ENV === 'development') {
    email = 'wannaplaymeapp@gmail.com';
  }

  var details = 'Reset your password by clicking on the link below<br /><a href="http://' + host + '/password-reset/' + user._id + '/' + verificationToken + '">http://' + host + '/password-reset/' + user._id + '/' + verificationToken + '</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Password Reset</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p>A password reset request was made at wannaplay.me. If you did not make this request you can ignore this email.</p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: fromEmail, // sender address
    to: email, // list of receivers
    subject: 'WannaPlayMe Password Reset', // Subject line
    text: 'Reset your password at http://' + host + '/password-reset/' + user._id + '/' + verificationToken, // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

function sendMail(mailOptions) {
  if (process.env.NODE_ENV === 'development') {
    //return null;
  }
  var transporter = nodemailer.createTransport(credentials.smtp);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}