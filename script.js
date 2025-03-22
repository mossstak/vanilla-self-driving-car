const carCanvas = document.getElementById('carCanvas')
carCanvas.width = 200
const networkCanvas = document.getElementById('networkCanvas')
networkCanvas.width = 800

const carCtx = carCanvas.getContext('2d')
const networkCtx = networkCanvas.getContext('2d')
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9)
const car = new Car(road.getLaneCenter(1), 100, 30, 50, 'AI')

const NUM_DUMMY_CARS = 10; // Number of dummy cars to generate
const traffic = generateTraffic(NUM_DUMMY_CARS);

let N = localStorage.getItem('carsCount')
  ? parseInt(localStorage.getItem('carsCount'))
  : 100
const cars = generateCars(N)

let bestCar = cars[0]
if (localStorage.getItem('bestBrain')) {
  for (let i = 0; i < cars.length; i++) {
    bestCar.brain = JSON.parse(localStorage.getItem('bestBrain'))

    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.1)
    }
  }
}

function generateTraffic(count) {
  const dummyCars = [];
  for (let i = 0; i < count; i++) {
    const lane = Math.floor(Math.random() * 4); // Assuming 4 lanes (0 to 3)
    const yPosition = -Math.random() * 1000; // Spread out along the road
    dummyCars.push(new Car(road.getLaneCenter(lane), yPosition, 30, 50, "DUMMY", 2, getRandomColor()));
  }
  return dummyCars;
}
// const traffic = [
//   new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(3), 300, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(1), 300, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(2), 500, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(1), 400, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(3), 100, 30, 50, 'DUMMY', 2, getRandomColor()),
//   new Car(road.getLaneCenter(2), 400, 30, 50, 'DUMMY', 2, getRandomColor()),
// ]

animate()

function save() {
  localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard() {
  localStorage.removeItem('bestBrain')
}

function carsCount(event) {
  localStorage.setItem('carsCount', event.target.value)
}

document.getElementById("refreshButton").addEventListener("click", () => {
  location.reload(); // Reloads the page
});


document.addEventListener("DOMContentLoaded", () => {
  const carsCountSelect = document.getElementById("carsCount");
  const savedCount = localStorage.getItem('carsCount');
  
  if (savedCount) {
    carsCountSelect.value = savedCount; // Set the dropdown value
  }
});

function generateCars(N) {
  const cars = []
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI'))
  }
  return cars
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, [])
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic)
  }

  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)))

  car.update(road.borders, traffic)
  carCanvas.height = window.innerHeight
  networkCanvas.height = 800

  carCtx.save()
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

  road.draw(carCtx)
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx)
  }

  carCtx.globalAlpha = 0.2
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx)
  }

  carCtx.globalAlpha = 1
  bestCar.draw(carCtx, true)

  carCtx.restore()

  networkCtx.lineDashOffset = -time / 50
  Visualizer.drawNetwork(networkCtx, bestCar.brain)
  requestAnimationFrame(animate)
}
