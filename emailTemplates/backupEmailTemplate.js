// emailTemplates/backupEmailTemplate.js

const getBackupEmailTemplate = (email, date = new Date()) => {
    const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return {
        subject: 'Your MoneyTrackr PDF Backup',
        text: `Hello,
  
  Please find attached your recent CashBook backup in PDF format.
  
  This report contains your transaction summary as of ${formattedDate}.
  
  If you did not request this backup, please ignore this email.
  
  Thanks,
  MoneyTrackr Support Team`,
        html: `
        <p>Hello,</p>
        <p>Please find attached your recent <strong>CashBook</strong> backup in PDF format.</p>
        <p>This report contains your transaction summary as of <strong>${formattedDate}</strong>.</p>
        <p>If you did not request this backup, please ignore this email.</p>
        <br/>
        <p>Thanks,<br/>The <strong>MoneyTrackr</strong> Team</p>
      `
    };
};

module.exports = getBackupEmailTemplate;
