export const waitFor = (t: number) =>
	new Promise(resolve => {
		setTimeout(resolve, t);
	});

export const getRandom = (max: number) => Math.floor(Math.random() * max + 1);
