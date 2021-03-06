const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

const validateOrgRegister = require('../../validation/org/register');
const validateOrgLogin = require('../../validation/org/login');
const Test = require("../../models/Test").Test;

const Org = require('../../models/Orgs').Org;
const OrgTests = require('../../models/Orgs').orgTests

router.post('/register', (req, res) => {
    const { errors, isValid } = validateOrgRegister(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Org.findOne({ email:req.body.email,clubCode: req.body.clubCode, testId: req.body.testId }, (err, result) => {
        if (result) {
            return res.status(400).json({ testId: "The test ID combination already exists for this club code.Please select another test ID & club code combination." })
        } else {
            const newOrg = new Org({
                clubName: req.body.clubName,
                clubCode: req.body.clubCode,
                email: req.body.email,
                password: req.body.password,
                mobileNo: req.body.mobileNo,
                extras: req.body.extras,
                testId: req.body.testId
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newOrg.password, salt, (err, hash) => {
                    if (err) throw errl
                    newOrg.password = hash;

                    Test.findOne({ testId: req.body.testId }, (err, result) => {
                        if (err) res.status(400).json({ err: "Error occured" })
                        else {

                            if (result == null) {

                                // create the test
                                var OrgTest = new OrgTests({ testId: req.body.testId, clubCode: req.body.clubCode, start: false, userScores: [] })
                                var test = new Test({ testId: req.body.testId, clubCode: req.body.clubCode })
                                Promise.all([newOrg.save(), OrgTest.save(), test.save()])
                                    .then((result) => { res.send(test) })
                                    .catch((err) => res.send(err))
                            }
                            else {
                                if (result == null)
                                    next({ err: 'No such test ID exists' })
                                else {
                                    return res.status(400).json({ testId: "The test ID already exists.Please try different one" })
                                }
                            }
                        }
                    })
                    // newOrg
                    //     .save()
                    //     .then(org => res.json(org))
                    //     .catch(err => res.send(err))
                });
            });

        }
    });
})

router.post('/login', (req, res) => {
    const { errors, isValid } = validateOrgLogin(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
    const testId=req.body.testId
    Org.findOne({ email, testId }).then(org => {

        if (!org) {
            return res.status(400).json({ email: 'Email Id not found' });
        }

        bcrypt.compare(password, org.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    id: org.id,
                    clubName: org.clubName,
                    clubCode: org.clubCode,
                    testId: org.testId
                };

                // Sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: '12h'
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                return res
                    .status(400)
                    .json({ passwordincorrect: "Password incorrect" });
            }
        })
    })

})

module.exports = router;