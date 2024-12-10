const KEY_MAP = {
	remote: {
	  KeyDown: {
		65: { type: "paddleMov", value: "left" }, // A
		68: { type: "paddleMov", value: "right" }, // D
	  },
	  KeyUp: {
		65: { type: "paddleMov", value: "false" }, // A
		68: { type: "paddleMov", value: "false" }, // D
	  },
	},
	local: {
	  KeyDown: {
		87: { type: "paddleMovLeft", value: "left" }, // W
		83: { type: "paddleMovLeft", value: "right" }, // S
		101: { type: "paddleMovRight", value: "left" }, // Numpad 5
		104: { type: "paddleMovRight", value: "right" }, // Numpad 8
	  },
	  KeyUp: {
		87: { type: "paddleMov1", value: "false" }, // W
		83: { type: "paddleMov1", value: "false" }, // S
		101: { type: "paddleMov2", value: "false" }, // Numpad 5
		104: { type: "paddleMov2", value: "false" }, // Numpad 8
	  },
	},
  };
  
  function handleKey(context, eventType, event) {
	const action = KEY_MAP[context][eventType][event.keyCode];
	if (action) {
	  core.gameSocket.send(JSON.stringify({ [action.type]: action.value }));
	}
  }
  
  export function onKeyDownRemote(event) {
	handleKey("remote", "KeyDown", event);
  }
  
  export function onKeyUpRemote(event) {
	handleKey("remote", "KeyUp", event);
  }
  
  export function onKeyDownLocal(event) {
	handleKey("local", "KeyDown", event);
  }
  
  export function onKeyUpLocal(event) {
	handleKey("local", "KeyUp", event);
  }
  