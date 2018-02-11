var assert = require('chai').assert
var request = require('request')
var supertest = require("supertest")
var server = supertest.agent("http://localhost:5000")
var sleep = require('sleep')

describe("Simple battleship API test", () => {
  it("Test Create Game", (done) =>{
    server
    .get("/newgame/matus")
    .expect(200)
    .end(function(err, res){
      if(err) return done(err)
      done()
    })
  })
  it("Test Continue Game", (done) => {
    server
    .get("/play/matus")
    .expect(200)
    .end(function(err,res){
      if(err) return done(err)
        done()
    })
  })
  it("Test Shot", (done) => {
    server
    .get("/shoot/2,2")
    .expect(200)
    .end(function(err, res){
      assert.equal(200,res.status)
      if(err) return done(err)
        done()
    })
  })
  it("Test Same position shot", (done) => {
    server
    .get("/shoot/2,2")
    .expect(200)
    .end(function(err, res){
      result = res.text
      assert.equal("This cell already been shot", result)
      assert.equal(200,res.status)
      if(err) return done(err)
        done()
    })
  })
    it("Test Shot wrong position", (done) => {
    server
    .get("/shoot/-1,0")
    .expect(200)
    .end(function(err, res){
      result = res.text
      assert.equal("wrong position", result)
      assert.equal(200,res.status)
      if(err) return done(err)
        done()
    })
  })
})



