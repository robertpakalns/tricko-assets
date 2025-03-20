const percentile = (arr, p) => {
    const index = (p / 100) * (arr.length - 1)
    const lower = Math.floor(index)
    const upper = lower + 1
    const weight = index % 1
    return upper >= arr.length ? arr[lower] : arr[lower] * (1 - weight) + arr[upper] * weight
}

const average = data => {
    const prices = data.map(i => i.price)
    prices.sort((a, b) => a - b)
    let filteredPrices = prices.filter(i => i >= percentile(prices, 50) * 0.5)
    const Q1 = percentile(filteredPrices, 25)
    const Q3 = percentile(filteredPrices, 75)
    const IQR = Q3 - Q1
    filteredPrices = filteredPrices.filter(i => i >= Q1 - 1.5 * IQR && i <= Q3 + 1.5 * IQR)
    return filteredPrices.length === 0 ? "" : (filteredPrices.reduce((acc, el) => acc + el, 0) / filteredPrices.length).toFixed(0)
}

const marketFetch = async () => {
    for (let i = 300; i <= 531; i++) {
        await fetch("https://voxiom.io/market/price_history", {
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ item_type: i }),
            method: "POST"
        })
            .then(r => r.json())
            .then(data => console.log(average(data.data.price_history)))
    }
}

marketFetch()