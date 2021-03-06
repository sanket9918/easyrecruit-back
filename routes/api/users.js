const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");


const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const Test = require("../../models/Test").Test;

// Load User model
const User = require("../../models/User").User


router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ regNo: req.body.regNo,testId:req.body.testId,email:req.body.email }).then(user => {
    console.log(user)
    if (user!=null) {
      return res.status(400).json({ regNo: "Registration No. already exists" });
    } else {

      Test.findOne({ testId: req.body.testId, clubCode: req.body.clubCode }, (err, result) => {
        if (err) {
          res.status(400).json({ testId: "Error occured" })
          return
        }
        else {
          if (result == null) {
            res.status(400).json({ testId: "Test ID does not belong to any valid test of the club", clubCode: "Please check for a valid Club Code and Test ID combination" })
            return
          }
          else {
            const newUser = new User({
              name: req.body.name,
              regNo: req.body.regNo,
              mobileNo: req.body.mobileNo,
              blockName: req.body.blockName,
              roomNo: req.body.roomNo,
              clubCode: req.body.clubCode,
              email: req.body.email,
              password: req.body.password,
              testId: req.body.testId
            });

            // Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then(user => res.json(user))
                // .catch(err => console.log(err));
              });
            });
          }
        }
      })
    }
  });
});
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const regNo = req.body.regNo;
  const password = req.body.password;
  const testId=req.body.testId;
  // Find user by email
  User.findOne({ regNo,testId }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ regNoNotFound: "Incorrect credential combination", testidIncorrect: "Please check & try again" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          regNo: user.regNo,
          clubCode: user.clubCode,
          testId: user.testId,
          mobileNo: user.mobileNo,
          email: user.email,
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: '3h'
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
    });
  });
});

module.exports = router;
