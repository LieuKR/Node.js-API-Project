import * as mysql from 'mysql2';

const GenerateQuery = {

  userApi: {

    CheckSameEmailAccountNumber: function(inputEmail: string){
      let escapeEmail = mysql.escape(inputEmail);
      let query = `
      SELECT COUNT(*) as cnt 
      FROM account 
      WHERE email = ${escapeEmail};
      `;
      return query;
    },

    CreateNewAccount: function(inputEmail: string, encryptedPass: string){
      let escapeEmail = mysql.escape(inputEmail);
      let query = `
      INSERT INTO account 
      SET email = ${escapeEmail}, password = "${encryptedPass}";
      `;
      return query;
    },

    SelectUserAccountColumnByEmail: function(inputEmail: string){
      let escapeEmail = mysql.escape(inputEmail);
      let query = `
      SELECT a.id, a.email, a.password, a.AvaliableLoginReq, a.LastLoginAttemptTimestamp 
      FROM userinfo.account as a 
      WHERE email = ${escapeEmail};
      `
      return query;
    },
  
    AfterSuccessUserLogin: function(MaxLoginAttemptFailNum: number, currentTime: number, PK: number){
      let query = `
      UPDATE account 
      SET 
        AvaliableLoginReq = ${MaxLoginAttemptFailNum},
        LastLoginAttemptTimestamp = ${currentTime}
      WHERE (id = ${PK});
      `
      return query;
    },
  
    AfterFailUserLogin: function(MaxLoginAttemptFailNum: number, currentTime: number, PK: number){
      let query = `
      UPDATE account 
      SET 
        AvaliableLoginReq = ${MaxLoginAttemptFailNum - 1},
        LastLoginAttemptTimestamp = ${currentTime}
      WHERE (id = ${PK});
      `
      return query;
    },

    IsUserPasswordTrue: function(inputEmail: string, HashedInputPass: string){
      let escapeEmail = mysql.escape(inputEmail);
      let query = `
      SELECT id, COUNT(*) as cnt 
      FROM account 
      WHERE email = ${escapeEmail} and password = "${HashedInputPass}"`
      return query;
    },

    changePassword: function(HashedInputPass: string, PK: number){
      let query = `
      UPDATE account SET password = "${HashedInputPass}" WHERE (id = ${PK});
      `
      return query;
    },

    deleteUserAccount: function(PK: number){
      let query = `
      DELETE FROM account WHERE (id = ${PK});
      `
      return query;
    },

  },

};

/**
 * @param schemaName DB schema name
 * @return DB connection
 */
const GetDBConnection = function(schemaName : string){

  return new Promise<mysql.Connection>(function(rs, rj){

    let connection = mysql.createConnection({
      host     : process.env.MARIADB_HOST,
      user     : process.env.MARIADB_USER,
      password : process.env.MARIADB_PASS,
      database : schemaName
    });
  
    connection.connect(function(err){
      if(err) return rj("Err-341DB");
      else return rs(connection)
    });
  
  })
};

export {GenerateQuery, GetDBConnection}