const child_process = require('child_process');

function startLeague(config_port) {
    const leaguePath = `"C:\\Riot Games\\Riot Client\\RiotClientServices.exe"`
    const args = ` --client-config-url="http://127.0.0.1:${config_port}" --launch-product=league_of_legends --launch-patchline=live`;
    const leagueProcess = child_process.exec(leaguePath + args);
    return leagueProcess;
}

const arg = process.argv[2];
startLeague(arg);

