//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

var Event = require('../models/event');
var Order = require('../models/order');
var User = require('../models/user')

chai.use(chaiHttp);

describe('Create Order', () => {
    it('it should create order', async (done) => {
        var event = await Event.create({
            "name": "quang",
            "date": "2020-Nov-3 16:27",
            "location": "Viet Nam",
            "price": 15,
            "quantity": 100
        });

        var user = await User.create({
            "name": "quang",
            "email": "quang@gmail.com.vn",
            "joinDate": "2020-Nov-3 16:27"
        })
        let order = {
            "user": user._id,
            "event": event._id,
            "quantity": 2
        };
        res = await chai.request(server)
                        .post('/orders/create_order')
                        .send(order)
                        .catch((error) => {
                            console.log("err: ", error)
                            done()
                        });
        res.should.have.status(200);
        res.body.success.should.equal(true)
        res.body.message.should.equal("New order created successfully")
        res.body.order.quantity.should.equal(2)


        let order_2 = {
            "user": user._id,
            "event": event._id,
            "quantity": 99
        };
        res = await chai.request(server)
                        .post('/orders/create_order')
                        .send(order_2)
                        .catch((error) => {
                            console.log("err: ", error)
                        });
        res.should.have.status(201);
        res.body.success.should.equal(false)
        res.body.message.should.equal("Not enough tiket to sold")
        done()
    });
});