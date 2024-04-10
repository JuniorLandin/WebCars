import { useEffect, useState } from "react";
import { Container } from "../../components/container";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Link } from "react-router-dom";

interface CarsProps{
  id: string;
  name: string;
  year: string;
  uid: string;
  valor: string | number;
  cidade: string;
  kmRodado: string;
  images: CarImageProps[];
}

interface CarImageProps{
  name: string;
  uid: string;
  url: string;
}

export function Home() {

  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState()

  useEffect(() => {
    loadCars();
  }, [])

  function loadCars() {
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))

    getDocs(queryRef)
     .then((snapshot) => {
      const listCars = [] as CarsProps[];

      snapshot.forEach( doc => {
        listCars.push({
          id: doc.id,
          cidade: doc.data().cidade,
          year: doc.data().year,
          name: doc.data().name,
          valor: doc.data().valor,
          kmRodado: doc.data().kmRodado,
          images: doc.data().images,
          uid: doc.data().uid
        })
      })

      setCars(listCars)
     })
  }

  async function handleSeachCar() {
    if(input === ''){
      loadCars();
      return
    }

    setCars([])
    setLoadImages([])

    const q = query(
      collection(db, "cars"),
      where("name", ">=", input.toUpperCase()),
      where("name", "<=", input.toUpperCase() + "\uf8ff")
    )

    const querySnapshot = await getDocs(q)

    const listCars = [] as  CarsProps[];

    querySnapshot.forEach((doc) => {
      listCars.push({
        id: doc.id,
        cidade: doc.data().cidade,
        year: doc.data().year,
        name: doc.data().name,
        valor: doc.data().valor,
        kmRodado: doc.data().kmRodado,
        images: doc.data().images,
        uid: doc.data().uid
      })
    })

    setCars(listCars)

  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImagesLoaded) => [...prevImagesLoaded, id])
  }

  return (
    <Container>
      <section className=" bg-zinc-800 p-4 rounded-lg w-full max-w-3xl flex mx-auto justify-center items-center gap-2">
        <input
          placeholder="Digite o nome do Carro"
          className="w-full h-9 border-2 rounded-lg px-4 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
         className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
         onClick={handleSeachCar}
        >
          Buscar
        </button>
      </section>

      <h1 className="text-white flex items-center justify-center mt-10 font-bold text-center text-2xl">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-5">
        {cars.map((car) => (
          <Link
            key={car.id}
            to={`/car/${car.id}`}
          >
            <section
              className="w-full bg-white rounded-lg overflow-hidden"
              >
              <div
               className="w-full h-64 rounded-lg bg-slate-200"
               style={{ display: loadImages.includes(car.id) ? "none" : "block"}}
               >
              </div>
              <img
                className="w-full rounded-lg mb-2 max-h-64 object-cover hover:scale-105 transition-transform"
                style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
                src={car.images[0].url}
                alt={car.name}
                onLoad={ () => handleImageLoad(car.id)}
              />
              <p
              className="font-bold mt-1 mb-2 px-2">{car.name}</p>
              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-3">{ car.year } | { car.kmRodado } km</span>
                <strong className="text-black font-medium text-xl">R$ {car.valor}</strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-zinc-700">
                  {car.cidade}
                </span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  )
}