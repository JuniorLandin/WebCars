import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Container } from "../../components/container";
import { db } from "../../services/firebaseConnection";

interface CarProps {
  id: string;
  name: string;
  kmRodado: string;
  model: string;
  valor: string | number;
  whatsapp: string;
  year: string;
  cidade: string;
  descricao: string;
  created: string;
  owner: string;
  uid: string;
  images: ImagesCarProps[];
}

interface ImagesCarProps{
  uid: string;
  name: string;
  url: string;
}

export function CarDetail() {

  const [car, setCar] = useState<CarProps>()
  const [sliderPerView, setSliderPerView] = useState<number>(2)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadCar(){
      if(!id){
        return
      }

      const docRef = doc(db, "cars", id)
      getDoc(docRef)
        .then((snapshot) => {

          if(!snapshot.data()){
            navigate("/")
          }

          setCar({
            id: snapshot.id,
            name: snapshot.data()?.name,
            year: snapshot.data()?.year,
            descricao: snapshot.data()?.descricao,
            cidade: snapshot.data()?.cidade,
            model: snapshot.data()?.model,
            uid: snapshot.data()?.uid,
            kmRodado: snapshot.data()?.kmRodado,
            created: snapshot.data()?.created,
            whatsapp: snapshot.data()?.whatsapp,
            valor: snapshot.data()?.valor,
            owner: snapshot.data()?.owner,
            images: snapshot.data()?.images
          })
        })

    }

    loadCar()
  }, [id, navigate])

  useEffect(() => {

    function handleResize(){
      if(window.innerWidth < 720){
        setSliderPerView(1)
      } else {
        setSliderPerView(2)
      }
    }
    handleResize()

    window.addEventListener("resize", handleResize)

    return() => {
      window.removeEventListener("resize", handleResize)
    }

  }, [])

  return (
    <main className="w-full -mt-4">
      <Container>

        {car && 
          <Swiper
            slidesPerView={sliderPerView}
            pagination= {{ clickable: true }}
            navigation
          >
            {car?.images.map( image => (
              <SwiperSlide key={image.name}>
                <img
                  alt={image.name}
                  src={image.url}
                  className="w-full h-72 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        }


        { car && (
          <main className="w-full bg-zinc-800 rounded-lg p-6 my-4">
            <div className="w-full flex flex-col sm:flex-row mb-4 items-center justify-between">
              <h1 className="text-white font-bold text-3xl">{ car.name }</h1>
              <h1 className="text-white font-bold text-3xl">R$ { car.valor }</h1>
            </div>

            <p className="text-white mt-1">{ car?.model }</p>

            <div className="mt-3">
              <div className="w-full flex gap-6">
                <div className="flex flex-col">
                  <span className="text-white text-xs">Cidade</span>
                  <strong className="text-white text-xs">{ car.cidade }</strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs">Ano</span>
                  <strong className="text-white text-xs">{car.year}</strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs">Km Rodado</span>
                  <strong className="text-white text-xs">{car.kmRodado}</strong>
                </div>
              </div>

              <div className="w-full mt-3">
                <h2 className="text-white font-bold text-xs">Descrição</h2>
                <p className="text-white  text-xs">{car.descricao}</p>
              </div>

              <div className="mt-3">
                <h2 className="text-white font-bold text-xs">Telefone</h2>
                <p className="text-white text-xs">{car.whatsapp}</p>
              </div>

              <a
              target="_blank"
              href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse ${car?.name} e fiquei interessado.`}
              className="cursor-pointer bg-green-500 w-full text-white  gap-2 my-6 h-11 text-xl font-medium rounded-lg flex items-center justify-center"
              >
                Conversar com o vendedor
                <FaWhatsapp />
              </a>
            </div>

          </main>
        )}
      </Container>


    </main>
  )
}