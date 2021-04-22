<p align="center"><a href="https://nodei.co/npm/discord-auditlog/"><img src="https://nodei.co/npm/discord-auditlog.png"></a></p>

# discord-auditlog
A simple Discord.js v12 Module that send join/leave/ban/unban and nickname/discriminator/username/avatar in custom channel.  

# Important note
This package is originally release as an NPMJS package named "discord-auditlog".  It's available at (https://www.npmjs.com/package/discord-auditlog)
While I accept suggestion and contribution, I can't provide support or vouch for to other forks.

This module have been Updated for DiscordJS V12 (tested under V12.5.2)  
If you are still running V11, please install the version 1.9.4: "npm i discord-auditlog@discord.js-v11"  

## Installation
This module assumes you already have a basic [Discord.js](https://discord.js.org/#/) bot setup.  
Simply type the following command to install the module and it depedencies.  
```
npm i discord-auditlog
``` 

Once you've done this, setting the module will be very easy.  
And you can follow the code  below to get started!  

### Type of log being tracked
Members movements: (default `channel: audit-log`)
- Member Join the Server
- Member Leave the Server
- Member is Kicked from the Server (Require "View Audit Log" Permission)
- Member is Banned
- Member is Unbanned
	
Auditlog (default `channel: audit-log`)
- Member Nickname Change
- Member Update Avatar
- Member Update Discriminator
- Member Update Username
	
Auditlog: (default `channel: audit-log`)
- Member Role Changed (require `trackrole: true`)
		
	
Audit Message: (disabled by default)
- Message Deleted
- Message Updated

Voice Status Update: (disabled by default)
- Member joining a Channel
- Member leaving a Channel
- Member switching a Channel

		
### Single-Server Usage without configuration (no server ID required in the configuration)
```js
const Auditlog = require("discord-auditlog");
// will send all event to #audit-logs channel
// will send movement (join/leave) to #in-out channel if the channel exist
Auditlog(bot);
```

### Single-Server Usage without configuration (no server ID required in the configuration)
```js
const Auditlog = require("discord-auditlog");
// will send all event to #audit-logs channel
// will send movement (join/leave) to #in-out channel if the channel exist
Auditlog(bot, {
	"serverid": {
		auditlog: "audit-log",	
		movement: "in-out",
		auditmsg: false, // Default to fasle, recommend to set a channel
		voice: false, // Set a Channel name if you want it
		trackroles: true, // Default is False
		// excludedroles: ['671004697850544111', '671004697850544112']  // This is an OPTIONAL array of Roles ID that won't be tracked
	}
});
```

### Multi-Servers Usage 
```js
const AutoRole = require("discord-streaming");
Auditlog(bot, {
	"serverid1": {
		auditlog: "audit-log",
		movement: "in-out",
		auditmsg: false, // Default to fasle, recommend to set a channel
		voice: false, // Set a Channel name if you want it
		trackroles: true, // Default is False
		excludedroles: ['671004697850544111', '671004697850544112']  // This is an OPTIONAL array of Roles ID that won't be tracked
	}
	"serverid2": {
		auditlog: "audit-log",
		movement: "in-out",
		auditmsg: false, // Default to fasle, recommend to set a channel
		voice: false, // Set a Channel name if you want it
		trackroles: true, // Default is False

	}
});
```

### English:
This module was initialy coded for the Bucherons.ca gamers community, the Star Citizen Organization "Gardiens du LYS", Bar Citizen Coordinators and Bar Citizen Montreal Discord Servers.  

### Français:
Ce module a initiallement été conçu pour la communauté de gamers Bucherons.ca, la communauté gaming pour adultes au Québec, l'organisation Québecoise dans Star Citizen des Gardiens du Lys, les serveurs Discord de Bar Citizen Coordinators et Québec Orbital / Bar Citizen Montreal.  
  
Liens:  https://www.bucherons.ca, https://www.gardiensdulys.com, https://www.barcitizen.sc, https://www.barcitizenmtl.com  

## Support:
You can reach me via my Discord Development Server at https://discord.gg/Tmtjkwz  

### History:  
2.4.0 - Adding Experimental Kick Detection Capability, improvement coming shortly! (Huge thanks to DarylJG94)
2.3.2 - Hotfix to prevent crashes related to new Stage Channel.  Require DiscordJS 12.5.2.  Will be improved once DiscordJS fully support these channel.
2.2.5 - Improved README.md format (OwenPotent)  
2.2.3 - Added ability to use channel ID instead of channel name (it check name, then id if name isn`t found)  
2.2.2 - Initial commit to GitHub  
2.0.0 - Initial DiscordJS V12 Compatibility  
1.9.4 - Latest version compatible with DiscordJS V11, use "npm i discord-auditlog@discord.js-v11" to install  
