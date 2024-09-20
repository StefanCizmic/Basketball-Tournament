import groupsJSON from './basketball-tournament-task-main/groups.json' with {type: 'json'};
import exibitionsJSON from './basketball-tournament-task-main/exibitions.json'with { type: 'json'};

const groups = groupsJSON;
const exibitions = exibitionsJSON;

let groupStage = {};
let groupStageStatistics = {};
let hat = {D: [], E: [], F: [], G: []};
let quarterFinals = {};
let semiFinals = {};
let finals = {};

const generatePairs = (stage, team) => {
    for (let group in team) {
        const teams = team[group];
        stage[group] = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                stage[group].push({
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
    return stage;
}

generatePairs(groupStage, groups);

const winProbability = (teams) => {
    for (let groupSt in teams) {
        const group = teams[groupSt];
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

winProbability(groupStage);

const getResults = (teams) => {
    const shotsPerGame = Math.floor(Math.random() * (190 - 150 + 1)) + 150;
    for (let groupSt in teams) {
        const group = teams[groupSt];
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

getResults(groupStage);

console.log(`GROUP STAGE MATCHES`);

const displayMatches = (teams) => {
    for (let groupSt in teams) {
        console.log(`Group: ${groupSt}`)
        teams[groupSt].map(match => {
            console.log(`${match.Match.Team1.Team} vs ${match.Match.Team2.Team} = ${match.Result.Result1} : ${match.Result.Result2}`)
            console.log(`Win: ${match.Match.Win}`);
            console.log(`Lost: ${match.Match.Lost}`);
            console.log(`-----------------------`);
        })
    }
}

displayMatches(groupStage);

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

console.log(`-----------------------`);
console.log(`KNOCKOUT STAGE`);

const getKnockoutStage = () => {
    const groupPairs = [
        ['D', 'G'],
        ['E', 'F']
    ]
    groupPairs.map(([group1, group2]) => {
        const teams1 = hat[group1];
        const teams2 = hat[group2];
        quarterFinals[`${group1}-${group2}`] = [];
        for (let i = 0; i < Math.min(teams1.length, teams2.length); i++) {
            quarterFinals[`${group1}-${group2}`].push({
                        Match: {
                            Team1: teams1[i],
                            Team2: teams2[i],
                            Win: '',
                            Lost: ''
                        },
                        Odds: {},
                        Result: {}
                    });
        }
    })          
};

getKnockoutStage();

const displayQuarterFinals = () => {
for (let knockout in quarterFinals) {
    const knockouts = quarterFinals[knockout];
    knockouts.map(match => {
    console.log(`${match.Match.Team1.Team} - ${match.Match.Team2.Team}`)
    })
}
}

displayQuarterFinals();

console.log(`-----------------------`);

winProbability(quarterFinals);
getResults(quarterFinals);

console.log(`QUARTERFINALS MATCHES`)

displayMatches(quarterFinals);

console.log(`SEMIFINALS MATCHES`);

const filterQuarterFinals = () => {
    let winnerNames = [];
    let winners = {};
    for (let quarter in quarterFinals) {
        const quarterGames = quarterFinals[quarter];
        winners[quarter] = [];
        quarterGames.map(match => {
           const winner = match.Match.Win; 
           winnerNames.push(winner); 
           if (winner === match.Match.Team1.Team) {
               winners[quarter].push(match.Match.Team1);
           } else if (winner === match.Match.Team2.Team) {
               winners[quarter].push(match.Match.Team2);
           }
        });
    }
    semiFinals = (generatePairs(semiFinals, winners));
}

filterQuarterFinals();

winProbability(semiFinals);
getResults(semiFinals);
displayMatches(semiFinals);

console.log(`FINALS`)

const filterSemiFinals = () => {
    const winnerNames = [];
    const winners = {};
    for (let semi in semiFinals) {
     const semiGames = semiFinals[semi];
     winners[semi] = [];
     semiGames.map(match => {
         const winner = match.Match.Win;
         winnerNames.push(winner);
         if (winner === match.Match.Team1.Team) {
            winners[semi].push(match.Match.Team1);
         } else if (winner === match.Match.Team2.Team) {
            winners[semi].push(match.Match.Team2);
         }
     }) 
    }
    const team1 = winners["D-G"][0]; 
    const team2 = winners["E-F"][0];

    finals["Final Match"] = [{
        Match: {
            Team1: team1,
            Team2: team2,
            Win: '',
            Lost: ''
        },
        Odds: {},
        Result: {}
}];
};

filterSemiFinals();

winProbability(finals);
getResults(finals);
displayMatches(finals);
