
export function shuffleArray(arrayToShuffle: any[]) {
    const shuffledArray = arrayToShuffle

    for (var j = shuffledArray.length - 1; j > 0; j--) {
      var randomIndex = Math.floor(Math.random() * (j + 1));
      var temp = shuffledArray[j];
      shuffledArray[j] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temp;
    }
    return shuffledArray
}

export function range(n: number) {
    const list = []
    for (var i = 0; i <= n; i++) {
          list.push(i);
    }
    return list
}
