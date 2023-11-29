'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      name: 'Amin Rias',
      email : "hoho@gmail.com",
      password : "root",
      createdAt:"2023-10-17",
      updatedAt : "2023-10-17"
    },{
     name: 'Kakap Killer',
     email : "moon@gmail.com",
     password : "root,",
     createdAt:"2023-10-17",
     updatedAt : "2023-10-17"
   }
   ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
