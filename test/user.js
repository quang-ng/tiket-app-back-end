//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

var User = require('../models/user');

chai.use(chaiHttp);

describe('Create User', () => {
    it('it should create user', (done) => {
        let user = {
            "name": "quang",
            "email": "quang@gmail.com.vn",
            "joinDate": "2020-Nov-3 16:27"
        };
        chai.request(server)
            .post('/users/create_user')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('New user created successfully');
                res.body.user.should.have.property('_id');
                res.body.user.should.have.property('email').eql(user.email);
                res.body.user.should.have.property('joinDate').eql("2020-11-03T09:27:00.000Z");
                done();
            });
    });
    it('Cannot create user', (done) => {
        let user = {
            name: "Bug"
        };
        chai.request(server)
            .post('/users/create_user')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.errors[0].should.have.property('msg').eql("Email must not be empty.");
                done();
            });
    });
});


describe('GET users', () => {
    beforeEach((done) => {

        User.deleteMany({}, () => {
            var userDetail = {
                "name": "quang",
                "email": "quang@gmail.com.vn",
                "joinDate": "2020-Nov-3 16:30"
            }
            var user = new User(userDetail);
            user.save(function (err) {
                done();
            });
        })
        
    });
    it('it should GET users', (done) => {
        chai.request(server)
            .get('/users')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.users.length.should.be.eql(1);
                res.body.should.have.property('message').eql('Fetch list of user');
                done();
            });
    });
});


describe('Update users', () => {
    it('it should update user', async (done) => {
        var user = await User.create({
            "name": "quang",
            "email": "quang@gmail.com.vn",
            "joinDate": "2020-Nov-3 16:30"
        });
        var res = await chai.request(server)
            .post('/users/update_user?id=' + user._id)
            .send({
                "name": "quang nguyen",
            })        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User is updated');

        User.findById(user._id, (err, updated_user) => {
            chai.assert.equal(updated_user.name, "quang nguyen", 'test')
            done()
        })
    });
});