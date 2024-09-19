import groupsJSON from './basketball-tournament-task-main/groups.json' with {type: 'json'};
import exibitionsJSON from './basketball-tournament-task-main/exibitions.json'with { type: 'json'};

const groups = groupsJSON;
const exibitions = exibitionsJSON;

let groupStage = {};
let groupStageStatistics = {};
let hat = {D: [], E: [], F: [], G: []};

const generatePairs = () => {
    for (let group in groups) {
        const teams = groups[group];
        groupStage[group] = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                groupStage[group].push({
                    Match: {
                        Team1: teams[i],
                        Team2: teams[j],
                        Win: '',
                        Lost: ''
                    },
                    Odds: {},
                    Result: {}
                });
            }
        }
    }
}

generatePairs();

const winProbability = () => {
    for (let groupSt in groupStage) {
        const group = groupStage[groupSt];
        for (let i = 0; i < group.length; i++) {
            const match = group[i].Match;
            const teamOneProbability = +(match.Team2.FIBARanking / (match.Team1.FIBARanking + match.Team2.FIBARanking) * 100).toFixed(2);
            const teamTwoProbability = +(match.Team1.FIBARanking / (match.Team1.FIBARanking + match.Team2.FIBARanking) * 100).toFixed(2);
            group[i].Odds = {
                Odds1: teamOneProbability,
                Odds2: teamTwoProbability
            };
        }
    }
}

winProbability();

const results = () => {
    const shotsPerGame = Math.floor(Math.random() * (190 - 150 + 1)) + 150;
    for (let groupSt in groupStage) {
        const group = groupStage[groupSt];
        for (let i = 0; i < group.length; i++) {
            const odds = group[i].Odds;
            const teamOneResult = Math.floor((odds.Odds1 / 100) * shotsPerGame);
            const teamTwoResult = Math.floor((odds.Odds2 / 100) * shotsPerGame);
            group[i].Result = {
                Result1: teamOneResult,
                Result2: teamTwoResult
            };

            if (teamOneResult > teamTwoResult) {
                group[i].Match.Win = group[i].Match.Team1.Team;
                group[i].Match.Lost = group[i].Match.Team2.Team;
            } else if (teamTwoResult > teamOneResult) {
                group[i].Match.Win = group[i].Match.Team2.Team;
                group[i].Match.Lost = group[i].Match.Team1.Team;
            } else {
                group[i].Match.Win = 'Draw';
            }
        }
    }
}

results();

console.log(`GROUP STAGE MATCHES`);

const displayGroupStage = () => {
    for (let groupSt in groupStage) {
        console.log(`Group: ${groupSt}`)
        groupStage[groupSt].map(match => {
            console.log(`${match.Match.Team1.Team} vs ${match.Match.Team2.Team} = ${match.Result.Result1} : ${match.Result.Result2}`)
            console.log(`Win: ${match.Match.Win}`);
            console.log(`Lost: ${match.Match.Lost}`);
            console.log(`-----------------------`);
        })
    }
}

displayGroupStage();

console.log(`GROUP STAGE STATISTICS`);

const createGroupStageStatistics = () => {
    for (let group in groups) {
        const teamNames = groups[group];
        groupStageStatistics[group] = [];
        teamNames.map(team => {
            let teamName = team.Team;
            groupStageStatistics[group].push({
                TeamName: teamName,
                Win: 0,
                Lost: 0,
                Points: 0,
                ScoredShoots: 0,
                ReceivedShoots: 0,
                Differential: 0
            });
        });
    }
}

createGroupStageStatistics();

const getGroupStageStatistics = () => {
    for (let groupSt in groupStage) {
        groupStage[groupSt].map(matchs => {
            for (let groupStatistics in groupStageStatistics)
                groupStageStatistics[groupStatistics].map(teamStat => {
                    if (matchs.Match.Win === teamStat.TeamName) {
                        teamStat.Win++;
                    };
                    if (matchs.Match.Lost === teamStat.TeamName) {
                        teamStat.Lost++;
                    };
                    if (matchs.Match.Team1.Team === teamStat.TeamName) {
                        teamStat.ScoredShoots += matchs.Result.Result1;
                    };
                    if (matchs.Match.Team2.Team === teamStat.TeamName) {
                        teamStat.ScoredShoots += matchs.Result.Result2;
                    };
                    if (matchs.Match.Team1.Team === teamStat.TeamName) {
                        teamStat.ReceivedShoots += matchs.Result.Result2;
                    };
                    if (matchs.Match.Team2.Team === teamStat.TeamName) {
                        teamStat.ReceivedShoots += matchs.Result.Result1;
                    };
                    teamStat.Points = (teamStat.Win * 2) + teamStat.Lost;
                    teamStat.Differential = (teamStat.ScoredShoots - teamStat.ReceivedShoots);
                    if (teamStat.Differential < 0) {
                        teamStat.Differential = -1 * (teamStat.ScoredShoots - teamStat.ReceivedShoots);
                    } else;
                })
        })
    }
};

getGroupStageStatistics();

const displayGroupStageStatistics = () => {
    for (let groupStatistics in groupStageStatistics) {
        const sorted = groupStageStatistics[groupStatistics].sort((a, b) => (b.Points && b.ScoredShoots) - (a.Points && a.ScoredShoots));
        console.log(`Group: ${groupStatistics}`)
        sorted.map(teamStat => {
            console.log(`${teamStat.TeamName} / ${teamStat.Win} / ${teamStat.Lost} / ${teamStat.Points} / ${teamStat.ScoredShoots} / ${teamStat.ReceivedShoots} / ${teamStat.Differential}`);
        });
    }
}

displayGroupStageStatistics();

console.log(`-----------------------`);
console.log(`DRAW`);

const getRanks = () => {
    let filteredTeams = {};
    let ranked = [];
    for (let groupStatistics in groupStageStatistics) {
        filteredTeams[groupStatistics] = [];
        const teams = groupStageStatistics[groupStatistics];
        const lowestPoints = Math.min(...teams.map(team => team.Points));
        filteredTeams[groupStatistics] = teams.filter(team => team.Points > lowestPoints);
    }
    for (let group in filteredTeams) {
        const teams = filteredTeams[group];
        const firstPlacePoints = Math.max(...teams.map(team => team.Points));
        const thirdPlacePoints = Math.min(...teams.map(team => team.Points));
        const firstPlaceTeams = teams.filter(team => team.Points === firstPlacePoints ? team.TeamName : '');
        const secondPlaceTeams = teams.filter(team => team.Points < firstPlacePoints && team.Points > thirdPlacePoints);
        const thirdPlaceTeams = teams.filter(team => team.Points === thirdPlacePoints ? team.TeamName : '');
        ranked.push(...firstPlaceTeams, ...secondPlaceTeams, ...thirdPlaceTeams);
    }
    ranked.sort((a, b) => (b.Points && b.ScoredShoots) - (a.Points && a.ScoredShoots));
    ranked.map((rankedTeam, index) => {
        for (let group in groups) {
            groups[group].map(team => {
                if (rankedTeam.TeamName === team.Team) {
                    if (index < 8) {
                        if (index < 2) {
                            hat.D.push(team);
                        } else if (index < 4) {
                            hat.E.push(team);
                        } else if (index < 6) {
                            hat.F.push(team);
                        } else if (index < 8) {
                            hat.G.push(team);
                        }
                    }
                }
            });
        }
    });
}

getRanks();

const displayRankedTeams = () => {
    for (let key in hat) {
        console.log(`${key}:`);
        hat[key].map(team => {
            console.log(`  ${team.Team}`);
        });
    }
};

displayRankedTeams();


