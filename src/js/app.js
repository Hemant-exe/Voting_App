//import "../css/style.css"

const Web3 = require("web3");
const contract = require("@truffle/contract");

const votingArtifacts = require("../../build/contracts/Voting.json");
var VotingContract = contract(votingArtifacts);

window.App = {
  eventStart: async function () {
    window.ethereum.request({ method: "eth_requestAccounts" });
    VotingContract.setProvider(window.ethereum);
    VotingContract.defaults({
      // from: "0x2443D4bD5486Fc424F130718f6066cA82de794E8",
      gas: 6654755,
    });

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    App.account = accounts[0]; // Set the primary account
    $("#accountAddress").html("Your Account: " + App.account);
    // // Load account data
    // App.account = window.ethereum.selectedAddress;
    // $("#accountAddress").html(
    //   "Your Account: " + window.ethereum.selectedAddress
    // );
    VotingContract.deployed()
      .then(function (instance) {
        instance.getCountCandidates().then(function (countCandidates) {
          $(document).ready(function () {
            $("#addCandidate").click(function () {
              var nameCandidate = $("#name").val();
              var partyCandidate = $("#party").val();

              if (!nameCandidate || !partyCandidate) {
                $("#msg").html(
                  "<p>Please enter both name and party for the candidate.</p>"
                );
                return;
              }
              VotingContract.deployed()
                .then(function (instance) {
                  return instance.addCandidate(nameCandidate, partyCandidate, {
                    from: "0x2443D4bD5486Fc424F130718f6066cA82de794E8", // Set the from address
                  });
                })
                .then(function (result) {
                  $("#msg").html("<p>Candidate added successfully!</p>");
                })
                .catch(function (err) {
                  $("#msg").html(
                    "<p>Error adding candidate: " + err.message + "</p>"
                  );
                  console.error("ERROR! " + err.message);
                });
            });
            $("#addDate").click(function () {
              var startDate =
                Date.parse(document.getElementById("startDate").value) / 1000;

              var endDate =
                Date.parse(document.getElementById("endDate").value) / 1000;

              instance
                .setDates(startDate, endDate, {
                  from: "0x2443D4bD5486Fc424F130718f6066cA82de794E8",
                })
                .then(function (rslt) {
                  console.log("Date have been set");
                });
            });

            instance
              .getDates()
              .then(function (result) {
                var startDate = new Date(result[0] * 1000);
                var endDate = new Date(result[1] * 1000);

                $("#dates").text(
                  startDate.toDateString("#DD#/#MM#/#YYYY#") +
                    " - " +
                    endDate.toDateString("#DD#/#MM#/#YYYY#")
                );
              })
              .catch(function (err) {
                console.error("ERROR! " + err.message);
              });
          });

          for (var i = 0; i < countCandidates; i++) {
            instance.getCandidate(i + 1).then(function (data) {
              var id = data[0];
              var name = data[1];
              var party = data[2];
              var voteCount = data[3];
              var viewCandidates =
                `<tr><td> <input class="form-check-input" type="radio" name="candidate" value="${id}" id=${id}>` +
                name +
                "</td><td>" +
                party +
                "</td><td>" +
                voteCount +
                "</td></tr>";
              $("#boxCandidate").append(viewCandidates);
            });
          }

          window.countCandidates = countCandidates;
        });

        instance.checkVote().then(function (voted) {
          console.log(voted);
          if (!voted) {
            $("#voteButton").attr("disabled", false);
          }
        });
      })
      .catch(function (err) {
        console.error("ERROR! " + err.message);
      });
  },

  vote: function () {
    var candidateID = $("input[name='candidate']:checked").val();
    if (!candidateID) {
      $("#msg").html("<p>Please vote for a candidate.</p>");
      return;
    }
    VotingContract.deployed()
      .then(function (instance) {
        instance
          .vote(parseInt(candidateID), { from: App.account })
          .then(function (result) {
            $("#voteButton").attr("disabled", true);
            $("#msg").html("<p>Voted</p>");
            window.location.reload(1);
          });
      })
      .catch(function (err) {
        console.error("ERROR! " + err.message);
      });
  },
};

window.addEventListener("load", function () {
  if (typeof web3 !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask");
    window.eth = new Web3(window.ethereum);
  } else {
    console.warn(
      "No web3 detected. Falling back to http://localhost:7545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for deployment. More info here: http://truffleframework.com/tutorials/truffle-and-metamask"
    );
    window.eth = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545")
    );
  }
  window.App.eventStart();
});
