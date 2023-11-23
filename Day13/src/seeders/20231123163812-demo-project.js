'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('projects', [{
      title: "The World Apps",
      description : "dapat menghentikan waktu selama 5-10 detik",
      image : "jotaro.jpg",
      start_date : new Date(),
      end_date : "2023-12-13",
      technologies : ["Node Js", "React Js", "Next Js", "Type Script"],
      createdAt : new Date(),
      updatedAt : new Date()
     },{
      title: "Haiya Haiya Haiya Pose Apps",
      description : "Pose pillarmen saat music theme mereka sedang berputar",
      image : "pillarmen.jpg",
      start_date : new Date(),
      end_date : "2024-2-13",
      technologies : ["Node Js", "Type Script"],
      createdAt : new Date(),
      updatedAt : new Date()
     }], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});

  }
};
