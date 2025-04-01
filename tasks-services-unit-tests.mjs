import assert from 'node:assert/strict';
import { describe, it } from 'mocha';
import * as teamsData from './fapi-teams-data.mjs';
import teamsServicesInit from './foccacia-services.mjs';
import * as datamem from './data/memory/foccacia-data-mem.mjs';



// Inicializa os módulos necessários
const teamsServices = teamsServicesInit()


function Group(id, name, description, updateCount, ownerId, teams =[]) {  
  this.id = id
  this.name = name
  this.description = description
  this.updateCount = updateCount
  this.ownerId = ownerId
  this.teams = teams 
}


describe('Testes de Grupos', function () {  
  /*describe('Obter Grupos', function () {
    it('deve retornar todos os grupos de um usuário', async function () {
      const userToken = '4d75a57d-eb8a-40f8-966f-a2591dd618b6';
      const userId = 1
      const expectedGroups = await datamem.getGroups(userId);
      console.log("tetas", expectedGroups )
      const actualGroups = await teamsServices.getGroups(userToken);
      console.log("mamas", actualGroups)

      const forcedExpected = [
        {
          "id": 1,
          "name": "Liga Portuguesa",
          "description": "Grupos dos melhores times de Portugal",
          "updateCount": 0,
          "ownerId": 1,
          "teams": []
        },
        {
          "id": 2,
          "name": "Liga Espanhola",
          "description": "Grupos dos melhores times da Espanha",
          "updateCount": 0,
          "ownerId": 1,
          "teams": []
        }
      ];

      assert.deepEqual(actualGroups, expectedGroups);
      assert.deepStrictEqual(actualGroups, forcedExpected);
    });
  });


    it('deve retornar um grupo específico se o usuário for o proprietário', async function () {
      const groupId = 1;
      const userToken = '4d75a57d-eb8a-40f8-966f-a2591dd618b6';

      const expectedGroup = await datamem.getGroup(groupId);
      const actualGroup = await teamsServices.getGroup(groupId, userToken);

      const forcedExpected = new Group (1, "Liga Portuguesa", "Grupos dos melhores times de Portugal", 0, 1)
      
      //assert.deepEqual(actualGroup, expectedGroup);
      assert.deepStrictEqual(
        JSON.parse(JSON.stringify(actualGroup)),
        JSON.parse(JSON.stringify(forcedExpected))
      );
      
    });
  });



  describe('Criar e Atualizar Grupos', function () {
    it('deve criar um novo grupo', async function () {
      const userId = 1;
      const userToken = '4d75a57d-eb8a-40f8-966f-a2591dd618b6';
      const groupData = {
        name: "Melhor clube",
        description: "ou seja o Benfica"
      };
      
      const actualGroup = await teamsServices.createGroup(groupData, userToken);
      console.log("actualGroup", actualGroup)
      const expectedGroup = await datamem.getGroup(actualGroup.id, userId);
      console.log("expectedGroup", expectedGroup)
      

      assert.deepEqual(actualGroup, expectedGroup);
    });
  });
});
/*
    it('deve atualizar um grupo existente', async function () {
      const userId = 1;
      const groupId = 1;
      const groupUpdater = {
        name: "Melhor clube",
        description: "ou seja o Benfica"
      };

      const expectedGroup = await datamem.updateGroup(groupId, groupUpdater);
      const actualGroup = await teamsServices.updateGroup(groupId, groupUpdater, userId);

      assert.deepEqual(actualGroup, expectedGroup);
    });
  });


  */
  describe('Gerenciar Times em Grupos', function () {
    /*it('deve adicionar um time a um grupo', async function () {
      const userId = 1;
      const groupId = 1;
      const teamName = "benfica";
      const team = {
        name: "benfica",
        league: "Primeira Liga",
        season: "2010"
      };
      const body = {
        league: "Primeira Liga",
        season: "2010"
      };

      const expectedGroup = await datamem.addTeamToGroup(team, groupId);
      const actualGroup = await teamsServices.addTeamToGroup(groupId, teamName, body, userId);

      assert.deepEqual(actualGroup, expectedGroup);
    });*/

    it('deve remover um time de um grupo', async function () {
      const userId = 1;
      const groupId = 1;
      const teamName = "benfica";
      const body = {
        league: "Primeira Liga",
        season: "2010"
      };

      const expectedGroup = await datamem.deleteTeamGroup(groupId, body, teamName);
      const actualGroup = await teamsServices.deleteTeamGroup(groupId, teamName, body, userId);

      assert.deepEqual(actualGroup, expectedGroup);
    });
  });


  describe('Excluir um Grupo', function () {
    it('deve excluir um grupo com sucesso', function () {
      const userId = 1;
      const groupId = 1;
      

      return datamem.deleteGroup(groupId).then(() => {
        return teamsServices.deleteGroup(groupId, userId).then((actualGroup) => {
          assert.deepEqual(actualGroup, null);
        });
      });
    });

    it('não deve excluir um grupo que não existe', function () {
      const userId = 1;
      const nonExistentGroupId = 999;

      return teamsServices.deleteGroup(nonExistentGroupId, userId).then(() => {
        assert.fail('Esperava-se um erro, mas a operação foi bem-sucedida');
      }).catch((err) => {
        assert.deepEqual(err.message, 'Grupo não encontrado');
      });
    });

    it('não deve excluir um grupo se o usuário não for o proprietário', function () {
      const userId = 2;
      const groupId = 1;

      return teamsServices.deleteGroup(groupId, userId).then(() => {
        assert.fail('Esperava-se um erro, mas a operação foi bem-sucedida');
      }).catch((err) => {
        assert.deepEqual(err.message, 'Acesso negado');
      });
    });
  });
});

describe('Testes de Times e Ligas', function () {
  it('deve retornar times para um nome de time válido', async function () {
    const teamName = 'Barcelona';
    const expectedTeams = await teamsData.getTeamByName(teamName);
    const actualTeams = await teamsServices.getTeam(teamName);

    const forcedExpected = {
      "0": {
        id: 529,
        name: "Barcelona",
        venue: "Estadi Olímpic Lluís Companys"
      }
    };

    assert.deepEqual(actualTeams, expectedTeams);
    assert.deepEqual(actualTeams, forcedExpected);
  });

  it('deve retornar ligas e temporadas de um time válido', async function () {
    const teamName = 'sertanense';
    const expectedLeagues = await teamsData.getLeagueByTeam(teamName);
    const actualLeagues = await teamsServices.getLeague(teamName);

    const forcedExpected = [
      {
        team: {
          id: 4794,
          name: "Sertanense",
          venue: "Campo de Jogos Dr. Marques dos Santos"
        },
        leagues: [
          {
            name: "Taça de Portugal",
            Id: 96,
            seasons: [
              { year: 2016 }, { year: 2017 }, { year: 2018 },
              { year: 2019 }, { year: 2020 }, { year: 2021 },
              { year: 2022 }, { year: 2023 }, { year: 2024 }
            ]
          },
          {
            name: "Campeonato de Portugal Prio - Group C",
            Id: 459,
            seasons: [
              { year: 2019 }, { year: 2022 }, { year: 2023 }, { year: 2024 }
            ]
          }
        ]
      }
    ];

    assert.deepEqual(actualLeagues, expectedLeagues);
    assert.deepEqual(actualLeagues, forcedExpected);
  });
});


/*describe('Testes de Autenticação', function () {
  describe('Validação de Login', function () {
    it('necessita um token válido para credenciais corretas', async function () {
      const username = 'usuarioTeste';
      const password = 'senhaTeste';
      const token = 'tokenValido123';

      await usersData.addUser({ name: username, password, token });
      const expectedToken = token;
      const actualToken = await passportService.validateUser(username, password);

      assert.deepEqual(actualToken, expectedToken);
    });

    it('deve retornar indefinido para credenciais inválidas', async function () {
      const username = 'usuarioInvalido';
      const password = 'senhaInvalida';

      const actualToken = await passportService.validateUser(username, password);

      assert.deepEqual(actualToken, undefined);
    });
  });
});*/