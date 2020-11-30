//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

var Event = require('../models/event');

chai.use(chaiHttp);

describe('Create_event', () => {
    it('it should create event', (done) => {
        let event = {
            "name": "over night show",
            "date": "2020-Nov-3 16:30",
            "location": "Viet Nam",
            "price": 15,
            "quantity": 100
        };
        chai.request(server)
            .post('/events/create_event')
            .send(event)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('New event created successfully');
                res.body.event.should.have.property('_id');
                res.body.event.should.have.property('name').eql("over night show");
                res.body.event.should.have.property('date').eql("2020-11-03T09:30:00.000Z");
                res.body.event.should.have.property('location').eql("Viet Nam");
                res.body.event.should.have.property('price').eql(15);
                done();
            });
    });
    it('Cannot create event', (done) => {
        let event = {
            name: "Bug",
            date: "2020-Nov-3 16:30",
            location: "Viet Nam"
        };
        chai.request(server)
            .post('/events/create_event')
            .send(event)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.errors.length.should.be.eql(2);
                res.body.errors[0].should.have.property('msg').eql("Price must not be empty.");
                res.body.errors[1].should.have.property('msg').eql("Quantity must not be empty.");
                done();
            });
    });
});


describe('GET event', () => {
    before((done) => {
        Event.deleteMany({}, () => {
            var eventDetail = {
                "name": "over night show 2",
                "date": "2020-Nov-3 16:27",
                "location": "Viet Nam",
                "price": 150,
                "quantity": 1000
            }
            var event = new Event(eventDetail);
            event.save(function (err) {
                done();
            });
        })
    });
    it('it should GET event', (done) => {
        chai.request(server)
            .get('/events')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Fetch list of event');
                res.body.events.length.should.be.eql(1);
                res.body.events[0].should.have.property('name').eql("over night show 2");
                res.body.events[0].should.have.property('price').eql(150);
                done();
            });
    });
});


describe('Update event', () => {
    it('it should update event', async (done) => {
        var event = await Event.create({
            "name": "quang",
            "date": "2020-Nov-3 16:27",
            "location": "Viet Nam",
            "price": 15,
            "quantity": 100
        });
        var res = await chai.request(server)
            .post('/events/update_event?id=' + event._id)
            .send({
                "price": 1522,
            })        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Event is updated');

        Event.findById(event._id, (err, updated_event) => {
            chai.assert.equal(updated_event.price, 1522, 'test')
            done()
        })
    });
});