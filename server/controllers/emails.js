var nodemailer = require('nodemailer');
var credentials = require('../config/credentials');
var _ = require('lodash');

var logo = 'https://lh3.googleusercontent.com/YIunCmWhpGWSj5CkUMEiMIUNfncRn2NsSkaE-pjta81XNjUTp-jn_mE5-3Ze9lmSL5JqrXisPqVSRFXeeilxK4q9H7MT7s4fqfJn44d1Knra3VHKOBqXQUGsJn_PHiCt42HFwsSUnoKElHyYAtL8HaP-Wj8llHsBq7BZp9tje9etylCwhpMgqMSYjWjWxHbzwvr-yLSAJHrpM9MyZyhqKKujFWw9coFN60YhwwV7XX1Ozllm4JB7KkfzPMYbX2-AG4LpZyXaSsqQBc2W9Broesx3mA8NdZa1wQu54ACTnJfLvKWbm20o_6m_eCxkdXCSVJwORvmuZu0PmNsHuAKtdQdCvycn_pr0uU7BgDJeXDLA1EzUCRG0s5gHUrrdsINr5PJIYpZBmBP6sP3WWGiiozzxyegKXDbvb61c--B0O3YIFaqqUXUI_oVF-tPQ1UJwu5sVPvjpbRer_dJCS10TjsyYcqeYDr3zHcha8w0TAmrAyOGhEPaXf_nIgwh7nyysbBR6pjU0Eatir3rgbKvJ3PoeDbJjezxbbjFC5mCo-gtjb02AJK2e-_4S10MMVlfRyTaDqn69BDccWyIGGBCVD_KnmRikNcoB3aovcOSO7SS5gfg=w218-h50-no';
var tagLine = '<i><b>WannaPlayMe</b> - Fight your way to the top!</i>';

// Player has requested to join a competition
exports.addPlayerRequest = function(competition, player, host) {
  var emails = [];
  _.forEach(competition.owners, function (owner) {
    emails.push(owner.email);
  });
  var email = emails.join();

  if (process.env.NODE_ENV === 'development') {
    email = 'wannaplaymeapp@gmail.com';
  }

  var joiner = player.firstName + ' ' + player.lastName;

  var handle = '<a href="http://' + host + '/pyramids/admin/' + competition._id + '">Handle Request</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Join Request</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px"><strong>' + joiner + '</strong></p> <p>has requested to join: <strong> ' + competition.name + '</strong></p> <p> <br> </p> <p>' + handle + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: '"WannaPlayMe" <admin@wannaplay.me>', // sender address
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

  var details = '<a href="http://' + host + '/pyramids/view/' + competitionId + '">View the competition</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Request Approved!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p> Your request to join <strong>' + competitionName + '</strong> has been approved</p> <p> <br> </p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: '"WannaPlayMe" <admin@wannaplay.me>', // sender address
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

  var details = 'You can still <a href="http://' + host + '/pyramids/view/' + competitionId + '">view the competition</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Request Denied :(</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p> Your request to join <strong>' + competitionName + '</strong> has been denied.</p> <p> <br> </p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: '"WannaPlayMe" <admin@wannaplay.me>', // sender address
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

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>Welcom to WannaPlayMe!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px">Welcome <strong>' + user.firstName + ' ' + user.lastName + '</strong></p> <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: '"WannaPlayMe" <admin@wannaplay.me>', // sender address
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

  var challenger = challenge.challenger.firstName + ' ' + challenge.challenger.lastName;
  var competitionName = challenge.competitionName;
  var timeLimit = '';
  if (challenge.timeLimit) {
    timeLimit = '<p>You have <b>' + (challenge.timeLimit * 24) + ' hours</b> to complete the challenge.</p>';
  }
  var details = 'You can view the challenge and post the result at <a href="http://' + host + '/pyramids/view/' + challenge.competitionId + '">WannaPlayMe</a>';

  var msg = '<table width="100%" bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" style="text-align:center"> <tbody> <tr> <td> <table bgcolor="#F7F7F7" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0px auto"> <tbody> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td align="center" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <div><img width="218" border="0" alt="WannaPlayMe Logo" style="display:block;border:none;outline:none;text-decoration:none" src="' + logo + '"></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#2196F3" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:36px;color:#FFFFFF;text-align:center;line-height:55px;font-weight:100"> <p>You\'ve been challenged!</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#FFFFFF" align="center"> <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td style="font-family:\'Proxima Nova\',Calibri,Helvetica,sans-serif;font-size:16px;color:#505050;text-align:center;line-height:25.6px;font-weight:normal;text-transform:none"> <p style="font-size: 20px"><strong>' + challenger + '</strong></p> <p>has challenged you in: <strong> ' + competitionName + '</strong></p> <p> <br> </p> ' + timeLimit + ' <p>' + details + '</p> <p> <br> </p> <p>' + tagLine + '</p> </td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> <tr> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> <td height="30" style="font-size:1px;line-height:1px">&nbsp;</td> <td width="41" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="center"> <table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"> <tbody> <tr> <td width="100%" align="center" height="1" style="font-size:1px;line-height:1px"> <div style="display:none;font-size:1px;color:#f7f7f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">&nbsp;</div> </td> </tr> </tbody> </table> </td> </tr> <tr> <td bgcolor="#F7F7F7" align="right" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td valign="top" width="100%"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right"> <tbody> <tr> <td height="39" style="font-size:1px;line-height:1px">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>';

  var mailOptions = {
    from: '"WannaPlayMe" <challenge@wannaplay.me>', // sender address
    to: opponentEmail, // list of receivers
    subject: 'WannaPlayMe Challenge', // Subject line
    text: 'You have been challenged', // plaintext body
    html: msg // html body
  };

  sendMail(mailOptions);
};

function sendMail(mailOptions) {
  var transporter = nodemailer.createTransport(credentials.smtp);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}