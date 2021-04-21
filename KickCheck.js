exports.KickCheck = async function(member){

    /**
     *  Checks if the user has left or was kicked on their own decision 
     * 
     *      Produced for discord-auditlog
     *      Produced By: DarylJG#9825
     * 
     */
    return new Promise(async function(resolve,reject) {
        try{

                let guild = member.guild;

                // Throw an error and reject the promise if the bot does not have sufficient permission
            if (!member.guild.me.hasPermission('VIEW_AUDIT_LOG')) throw 'Missing Permission To View Audit Log';

            // Grab the last audit log entry for kicks
            const AuditLogFetch = await guild.fetchAuditLogs({
              limit: 1,
              type: 'MEMBER_KICK',
            });

            // If No Result is found return a promise false
            if (!AuditLogFetch) return resolve(false);
            
            const FirstEntry = AuditLogFetch.entries.first();
  

            // If there is no entry made in the audit log in the last 5 seconds, resolve false as user was not kicked recently 
            if (FirstEntry.createdTimestamp > (Date.now() - 5000) === false) return resolve(false);
            const { executor, target } = FirstEntry;
  
                // If user was kicked return an object containing information
              const Info = {
                "user":target.username,
                "id":target.id,
                "kickedby":executor.username,
                "reason":FirstEntry.reason,
              }
 
              return resolve(Info);

        }catch(e){

            // Any unhandled issues above will reject the promise with an error
          reject(e);
        }
    });
  }