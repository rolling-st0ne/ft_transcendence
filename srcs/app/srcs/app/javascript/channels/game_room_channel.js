import consumer from "./consumer"
import MainSPA from "../packs/main_spa";

var obtainedValues = 
{
	rightPadY: 1,
	leftPadY: 1,
    ballx: 1,
    bally: 1,
    leftScore: 0,
    rightScore: 0,
}

var GameRoomInit = 
{
    createGameRoom: function (args) {
        let $this = this;
        obtainedValues.rightPadY = 1;
        obtainedValues.leftPadY = 1;
        obtainedValues.ballx = 1;
        obtainedValues.bally = 1;
        obtainedValues.leftScore = 0;
        obtainedValues.rightScore = 0;
        const GameRoom = consumer.subscriptions.create({channel: "GameRoomChannel", match_id: args.match_id}, {
            connected() {
            // Called when the subscription is ready for use on the server
                console.log("Connected to game room channel " + args.match_id);
                $this.user_id = args.user_id;
                consumer.id = args.user_id;
            },

            disconnected() {
				console.log("Disconnected from game channel " + args.match_id);
              // Called when the subscription has been terminated by the server
            },

            received(data) {
                if (data == "start")
                    MainSPA.SPA.router.navigate("#/play/" + args.match_id);
                if (data.right)
                    obtainedValues.rightPadY = data.right;
                if (data.left)
                    obtainedValues.leftPadY = data.left;
                if (data.ball)
                {
                    obtainedValues.ballx = data.ball.x;
                    obtainedValues.bally = data.ball.y;
                }
                if (data.score)
                {
                    obtainedValues.leftScore = data.score.left;
                    obtainedValues.rightScore = data.score.right;
                }
            }
      });
      return GameRoom;
    }, 

}
export {obtainedValues};
export default GameRoomInit;