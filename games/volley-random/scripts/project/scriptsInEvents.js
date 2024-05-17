


const scriptsInEvents = {

	async Introevent_Event2_Act1(runtime, localVars)
	{
		runtime.globalVars.access_token = getWebsite_URL();
	},

	async Crazygames_Event1_Act2(runtime, localVars)
	{
		await crazysdk.displayAd('midgame');
	},

	async Crazygames_Event7_Act1(runtime, localVars)
	{
		crazysdk.gameplayStart();
	},

	async Crazygames_Event8_Act1(runtime, localVars)
	{
		crazysdk.gameplayStop();
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

