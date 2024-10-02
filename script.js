import groupsJSON from './data/groups.json' with {type: 'json'};
let groups = groupsJSON;

const musicButtons = document.querySelectorAll('.fa-volume-high, .fa-volume-xmark');
const song = document.getElementById('song');
const playButton = document.getElementById("play-button");
const playAgain = document.getElementById('play-again');
const heading = document.getElementById('tournament-heading');
const playMsg = document.getElementById('play-msg');
const proceedMsg = document.getElementById('proceed-msg');
const drawMsg = document.getElementById('draw-msg');
const knockoutsMsg = document.getElementById('knockouts-msg');
const semiFinalsMsg = document.getElementById('semi-finals-msg');
const finalsMsg = document.getElementById('finals-msg');
const gameContainer = document.getElementById('game');
const groupsContainer = document.getElementById('groups-container');
const groupStageContainer = document.getElementById('group-stage-container');
const statisticsContainer = document.getElementById('statistics-container');
const drawContainer = document.getElementById('draw-container')
const quarterFinalsContainer = document.getElementById('quarter-finals-container')
const semiFinalsContainer = document.getElementById('semi-finals-container')
const finalsContainer = document.getElementById('finals-container')

let groupStage = {};
let groupStageStatistics = {};
let hat = {
    D: [],
    E: [],
    F: [],
    G: [],
};
let quarterFinals = {};
let semiFinals = {};
let finals = {};

const getWinProbability = (team1, team2) => {
    const teamOneProbability = +(
        (team2.FIBARanking / (team1.FIBARanking + team2.FIBARanking)) *
        100
    ).toFixed(2);
    const teamTwoProbability = +(
        (team1.FIBARanking / (team1.FIBARanking + team2.FIBARanking)) *
        100
    ).toFixed(2);
    return {
        Odds1: teamOneProbability,
        Odds2: teamTwoProbability,
    };
};

const getResults = (odds, team1, team2) => {
    const winnerShots = Math.floor(Math.random() * (120 - 100) + 100);
    const loserShots = Math.floor(Math.random() * (100 - 80) + 80);
    if (odds.Odds1 > odds.Odds2) {
        return {
            Result1: winnerShots,
            Result2: loserShots,
            Won: team1.Team,
            Lost: team2.Team,
        };
    } else if (odds.Odds1 < odds.Odds2) {
        return {
            Result1: loserShots,
            Result2: winnerShots,
            Won: team2.Team,
            Lost: team1.Team,
        };
    } else;
};

const generateMatches = (stage, team) => {
    for (let group in team) {
        const teams = team[group];
        stage[group] = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const odds = getWinProbability(teams[i], teams[j]);
                const results = getResults(odds, teams[i], teams[j]);
                stage[group].push({
                    Match: {
                        Team1: teams[i],
                        Team2: teams[j],
                    },
                    Odds: {
                        ...odds,
                    },
                    Result: {
                        ...results,
                    },
                });
            }
        }
    }
    return stage;
};

const getMatches = (teams) => {
    let groupedMatches = {};
    for (let groupSt in teams) {
        if (!groupedMatches[groupSt]) {
            groupedMatches[groupSt] = [];
        }
        teams[groupSt].map((match) => {
            const matchDetails = {
                Team1: match.Match.Team1.Team,
                Team2: match.Match.Team2.Team,
                Result1: match.Result.Result1,
                Result2: match.Result.Result2
            };
            groupedMatches[groupSt].push(matchDetails);
        });
    }

    return groupedMatches;
};
const createGroupStageStatistics = () => {
    for (let group in groups) {
        const teamNames = groups[group];
        groupStageStatistics[group] = [];
        teamNames.map((team) => {
            let teamName = team.Team;
            groupStageStatistics[group].push({
                TeamName: teamName,
                Won: 0,
                Lost: 0,
                Points: 0,
                ScoredShoots: 0,
                ReceivedShoots: 0,
                Differential: 0,
            });
        });
    }
};

const getGroupStageStatistics = () => {
    for (let groupSt in groupStage) {
        groupStage[groupSt].map((matchs) => {
            for (let groupStatistics in groupStageStatistics)
                groupStageStatistics[groupStatistics].map((teamStat) => {
                    if (matchs.Result.Won === teamStat.TeamName) {
                        teamStat.Won++;
                    }
                    if (matchs.Result.Lost === teamStat.TeamName) {
                        teamStat.Lost++;
                    }
                    if (matchs.Match.Team1.Team === teamStat.TeamName) {
                        teamStat.ScoredShoots += matchs.Result.Result1;
                    }
                    if (matchs.Match.Team2.Team === teamStat.TeamName) {
                        teamStat.ScoredShoots += matchs.Result.Result2;
                    }
                    if (matchs.Match.Team1.Team === teamStat.TeamName) {
                        teamStat.ReceivedShoots += matchs.Result.Result2;
                    }
                    if (matchs.Match.Team2.Team === teamStat.TeamName) {
                        teamStat.ReceivedShoots += matchs.Result.Result1;
                    }
                    teamStat.Points = teamStat.Won * 2 + teamStat.Lost;
                    teamStat.Differential =
                        teamStat.ScoredShoots - teamStat.ReceivedShoots;
                    if (teamStat.Differential < 0) {
                        teamStat.Differential = -1 * (teamStat.ScoredShoots - teamStat.ReceivedShoots);
                    } else;
                });
        });
    }
};

const getRanks = () => {
    let filteredTeams = {};
    let ranked = [];
    for (let groupStatistics in groupStageStatistics) {
        filteredTeams[groupStatistics] = [];
        const teams = groupStageStatistics[groupStatistics];
        const lowestPoints = Math.min(...teams.map((team) => team.Points));
        filteredTeams[groupStatistics] = teams.filter(
            (team) => team.Points > lowestPoints
        );
    }
    for (let group in filteredTeams) {
        const teams = filteredTeams[group];
        const firstPlacePoints = Math.max(...teams.map((team) => team.Points));
        const thirdPlacePoints = Math.min(...teams.map((team) => team.Points));
        const firstPlaceTeams = teams.filter((team) =>
            team.Points === firstPlacePoints ? team.TeamName : ""
        );
        const secondPlaceTeams = teams.filter(
            (team) => team.Points < firstPlacePoints && team.Points > thirdPlacePoints
        );
        const thirdPlaceTeams = teams.filter((team) =>
            team.Points === thirdPlacePoints ? team.TeamName : ""
        );
        ranked.push(...firstPlaceTeams, ...secondPlaceTeams, ...thirdPlaceTeams);
    }
    ranked.sort(
        (a, b) => (b.Points && b.ScoredShoots) - (a.Points && a.ScoredShoots)
    );
    ranked.map((rankedTeam, index) => {
        for (let group in groups) {
            groups[group].map((team) => {
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
};

const getQuarterFinals = () => {
    const groupPairs = [
        ["D", "G"],
        ["E", "F"],
    ];
    groupPairs.map(([group1, group2]) => {
        const teams1 = hat[group1];
        const teams2 = hat[group2];
        quarterFinals[`${group1}-${group2}`] = [];
        for (let i = 0; i < Math.min(teams1.length, teams2.length); i++) {
            const odds = getWinProbability(teams1[i], teams2[i]);
            const results = getResults(odds, teams1[i], teams2[i]);
            quarterFinals[`${group1}-${group2}`].push({
                Match: {
                    Team1: teams1[i],
                    Team2: teams2[i],
                },
                Odds: {
                    ...odds,
                },
                Result: {
                    ...results,
                },
            });
        }
    });
};

const filterGames = (game) => {
    let winnerNames = [];
    let winners = {};
    for (let quarter in game) {
        const quarterGames = game[quarter];
        winners[quarter] = [];
        quarterGames.map((match) => {
            const winner = match.Result.Won;
            winnerNames.push(winner);
            if (winner === match.Match.Team1.Team) {
                winners[quarter].push(match.Match.Team1);
            } else if (winner === match.Match.Team2.Team) {
                winners[quarter].push(match.Match.Team2);
            }
        });
    }
    return winners;
};

const getSemiFinals = () => {
    const winners = filterGames(quarterFinals);
    semiFinals = generateMatches(semiFinals, winners);
};

const getFinals = () => {
    const winners = filterGames(semiFinals);
    const team1 = winners["D-G"][0];
    const team2 = winners["E-F"][0];
    const odds = getWinProbability(team1, team2);
    const results = getResults(odds, team1, team2);
    finals["Final Match"] = [{
        Match: {
            Team1: team1,
            Team2: team2,
        },
        Odds: {
            ...odds,
        },
        Result: {
            ...results,
        },
    }, ];
};

generateMatches(groupStage, groups);
getMatches(groupStage);
createGroupStageStatistics();
getGroupStageStatistics();
getRanks();
getQuarterFinals();
getMatches(quarterFinals);
filterGames();
getSemiFinals();
getMatches(semiFinals);
getFinals();
getMatches(finals);

let isMusicPlaying = false;
musicButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('fa-volume-xmark')) {
            song.play();
            musicButtons[0].style.display = 'block';
            musicButtons[1].style.display = 'none';
        } else {
            song.pause();
            musicButtons[0].style.display = 'none';
            musicButtons[1].style.display = 'block';
        }
        isMusicPlaying = !isMusicPlaying;
    });
});

const createCards = (stage) => {
    let cards = [];
    for (let group in stage) {
        const teams = stage[group];
        let card = document.createElement('div');
        let cardGroups = document.createElement('h3');
        cardGroups.innerText = `Group ${group}`;
        card.appendChild(cardGroups);
        teams.map(team => {
            let teamsP = document.createElement('p');
            card.appendChild(teamsP);
        });
        cards.push(card);
    }
    return cards;
}

let groupIndex = 0
const displayMatches = (stage, groupKey, display, message, time) => {
    const groups = stage[groupKey];
    const card = createCards(stage)[groupIndex];
    card.classList.add('group-stage-card');
    let matchIndex = 0;
    const displayMatch = () => {
        if (matchIndex < groups.length) {
            const match = groups[matchIndex];
            const cardP = card.querySelectorAll('p');
            cardP[matchIndex].innerText = `${match.Match.Team1.Team} vs ${match.Match.Team2.Team} = ${match.Result.Result1} : ${match.Result.Result2}`;
            display.appendChild(card);
            matchIndex++;
            setTimeout(displayMatch, time);
        } else {
            setTimeout(() => {
                display.removeChild(card);
                groupIndex++;
                if (groupIndex < Object.keys(stage).length) {
                    displayMatches(stage, Object.keys(stage)[groupIndex], display, message, time);
                } else {
                    message.style.display = 'block';
                }
            }, 2000)
        }
    }
    displayMatch();
}

const displayStatistics = () => {
    const table = `
    <table>
      <tr>
        <th>Team</th>
        <th>Wins</th>
        <th>Losts</th>
        <th>Points</th>
        <th>Scored</th>
        <th>Received</th>
        <th>Differential</th>
      </tr>
    </table>
  `;
    statisticsContainer.insertAdjacentHTML('beforeend', table);
    for (let groupStatistics in groupStageStatistics) {
        const sorted = groupStageStatistics[groupStatistics].sort(
            (a, b) => (b.Points || b.ScoredShoots) - (a.Points || a.ScoredShoots)
        );
        sorted.forEach((teamStat) => {
            const row = `
          <tr>
          <td>${teamStat.TeamName}</td>
          <td>${teamStat.Won}</td>
          <td>${teamStat.Lost}</td>
          <td>${teamStat.Points}</td>
          <td>${teamStat.ScoredShoots}</td>
          <td>${teamStat.ReceivedShoots}</td>
          <td>${teamStat.Differential}</td>
        </tr>
      `;
            statisticsContainer.querySelector('table').insertAdjacentHTML('beforeend', row);
        });
    }
}

const displayDraw = () => {
    for (let key in hat) {
        const groups = document.createElement('h3');
        groups.innerText = key;
        drawContainer.appendChild(groups);
        hat[key].map((team) => {
            const teams = document.createElement('p');
            teams.innerText = team.Team;
            drawContainer.appendChild(teams);
        });
    }
}

playButton.addEventListener("click", () => {
    playButton.style.display = "none";
    heading.innerText = 'Teams';
    const cards = createCards(groups);
    cards.forEach((card, index) => {
        card.classList.add('group-card');
        const teams = groups[Object.keys(groups)[index]];
        const cardP = card.querySelectorAll('p');
        cardP.forEach((p, i) => {
            if (teams[i]) {
                p.innerText = `${teams[i].Team} ${teams[i].FIBARanking}`;
            }
        });
        groupsContainer.appendChild(card);
    });
    setTimeout(() => {
        playMsg.style.visibility = 'visible';
    }, 4000);
});

playMsg.addEventListener('click', () => {
    playMsg.style.display = 'none';
    groupsContainer.style.display = 'none';
    heading.innerText = 'Group Stage';
    displayMatches(groupStage, Object.keys(groupStage)[groupIndex], groupStageContainer, proceedMsg, 1100);
});

proceedMsg.addEventListener('click', () => {
    proceedMsg.style.display = 'none';
    groupStageContainer.style.display = 'none';
    displayStatistics();
    heading.innerText = 'Statistics';
    setTimeout(() => {
        drawMsg.style.display = 'block';
    }, 4000)
});

drawMsg.addEventListener('click', () => {
    drawMsg.style.display = 'none';
    statisticsContainer.style.display = 'none';
    heading.innerText = 'Draw';
    displayDraw();
    setTimeout(() => {
        knockoutsMsg.style.display = 'block';
    }, 4000)
})

knockoutsMsg.addEventListener('click', () => {
    knockoutsMsg.style.display = 'none';
    drawContainer.style.display = 'none';
    heading.innerText = 'Quarter Finals';
    groupIndex = 0;
    displayMatches(quarterFinals, Object.keys(quarterFinals)[groupIndex], quarterFinalsContainer, semiFinalsMsg, 2000);
})

semiFinalsMsg.addEventListener('click', () => {
    semiFinalsMsg.style.display = 'none';
    quarterFinalsContainer.style.display = 'none';
    heading.innerText = 'Semi Finals';
    groupIndex = 0;
    displayMatches(semiFinals, Object.keys(semiFinals)[groupIndex], semiFinalsContainer, finalsMsg, 2000);
})

finalsMsg.addEventListener('click', () => {
    finalsMsg.style.display = 'none';
    semiFinalsContainer.style.display = 'none';
    heading.innerText = 'Finals';
    groupIndex = 0;
    displayMatches(finals, Object.keys(finals)[groupIndex], finalsContainer, null, 2000);
    setTimeout(() => {
        heading.style.display = 'none';
        gameContainer.style.alignItems = 'start';
        playAgain.style.display = 'block';
    }, 4000)
})

playAgain.addEventListener('click', () => {
    window.location.reload();
})