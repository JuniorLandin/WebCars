import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { FiTrash2 } from "react-icons/fi";
import { useContext, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { AuthContext } from "../../contents/AuthContext";
import { deleteObject, ref } from "firebase/storage";

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

export function Dashboard() {

  const[cars, setCars] = useState<CarsProps[]>([]);
  const { user } = useContext(AuthContext)

  useEffect(() => {

    function loadCars() {
      if(!user?.uid){
        return;
      }

      const carsRef = collection(db, "cars")
      const queryRef = query(carsRef, where("uid", "==", user.uid))

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

    loadCars();

  }, [user])

  async function handleDelete(car: CarsProps){
    const itemCar = car;

    const docRef = doc(db, "cars", itemCar.id)
    await deleteDoc(docRef)

    itemCar.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)

      try{
        await deleteObject(imageRef)
        setCars(cars.filter(car => car.id !== itemCar.id))
      } catch(err) {
        console.log("Erro ao tentar excluir essa imagem!")
      }
    })
  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2, lg:grid-cols-4">
        {cars.map((item) => (
          <section
            key={item.id}
            className="w-full bg-white rounded-lg overflow-hidden relative"
          >
            <button
            onClick={() => handleDelete(item)}
            className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2"
            >
              <FiTrash2 size={26} color="#000"/>
            </button>
            <img
              className="w-full object-cover rounded-lg mb-2 h-64"
              src={item.images[0].url}
              alt={item.name} 
            />

            <p className="font-bold mt-1 px-2 mb-2">{item.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                Ano {item.year} | {item.kmRodado} km
              </span>
              <strong className="text-black font-bold mt-4">R$ {item.valor}</strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className="px-2 pb-2">
              <span className="text-black">
                {item.cidade}
              </span>
            </div>
          </section>
        ))}

      </main>
    </Container>
  )
}