import consumer from "./consumer"

function disconnect_from_direct () {
  consumer.subscriptions.subscriptions.forEach((subscription) => {
    let found = subscription.identifier.search("\"channel\":\"DirectChannel\"")
    if (found != -1)
      consumer.subscriptions.remove(subscription)
  } )
}

let SubToDirect = {
    async join(id)
    {
      await disconnect_from_direct();
      consumer.subscriptions.create({channel: "DirectChannel", room_id: id}, {
      initialized() {
        this.id = id;
      },

      connected() {
        // Called when the subscription is ready for use on the server
      },

      disconnected() {
        // Called when the subscription has been terminated by the server
      },

      received(data) {
        if (data.direct_room_id == this.id)
        {
          $('#direct_messages').append(`
            <div class="message" data-user-id="${data.user_id}">
              <table>
                <tr><th><img class="user_icon" width="35px" height="35px" src="${data.avatar}" style="margin-bottom: 10px"></th>
                <th id="user-name">${data.displayname}:</th>
                <th id="message-content"> ${data.content} </th></tr>
              </table>
            </div>`)
            var element = document.getElementById("direct_messages");
            if (element != null)
              element.scrollTop = element.scrollHeight;
        }
      }
    })
  }
}

export default SubToDirect;