import { useEffect, useState } from 'react';
// import { db } from '../../firebase/firebase';
// import { get, ref } from "firebase/database";
import { Link } from 'react-router-dom';
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import Footer from '../../components/Footer/Footer';
import { ethers } from 'ethers';
import { WhaleFinanceAddress } from '../../utils/addresses';
import { WhaleFinanceAbi } from '../../contracts/WhaleFinance';

type DataPoint = {
    id: number;
    name: string;
    description: string;
};

export default function Manager({ account, provider, signer }: 
  { account: string | null; provider: any; signer: any;}) {

    // const {id} = useParams<{id: string}>();

    const [manager, setManager] = useState<number>(0);

    const [funds, setFunds] = useState<DataPoint[]>([]);

    async function getFundsForManager(){
      try{
        const whaleFinanceContract = new ethers.Contract(WhaleFinanceAddress, WhaleFinanceAbi, provider);
        const totalSupplies: ethers.BigNumber[] = await whaleFinanceContract.functions._fundIdCounter();
        const totalSupply = parseInt(totalSupplies[0]._hex);

        console.log(totalSupply); 

        const fundsList: DataPoint[] = [];

        await Promise.all(Array(totalSupply).fill(null).map(async (_, index) => {
          const ownerNft = await whaleFinanceContract.functions.ownerOf(index);
          if(String(ownerNft[0]).toLowerCase() == String(account).toLowerCase()){
            const fundName = await whaleFinanceContract.functions.fundsNames(index);
            const fundToShow: DataPoint = {
              id: index,
              name: fundName[0],
              description: ""
            }
            fundsList.push(fundToShow);
          }
        }));

        if(fundsList.length > 0){
          setManager(1);
        }

        setFunds([...fundsList]);

      } catch(err){
        console.log(err);
      }
    }

    useEffect(() => {
      getFundsForManager();
    },[signer]);

    useEffect(() => {
        // const fetchData = async () => {
        //   try {
        //     const dbRef = ref(db, 'Funds');
        //     const snapshot = await get(dbRef);
        //     if (snapshot.exists()) {
        //       const fbData = snapshot.val();
        //       setFunds(fbData);
        //     } else {
        //       console.log("No data available");
        //     }
        //   } catch (error) {
        //     console.error("Error reading data:", error);
        //   }
        // };
      
        // fetchData();
      }, []);

      function formatToUSD(number: number): string {
        const formattedNumber = new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(number / 1000000); // Convert to millions
      
        return `${formattedNumber} mi`;
    }

    const rentValue = 0.10;
    const formattedRent = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rentValue);

    const fundsElements = funds.map(fund => (
        <Link to={`/manager/${fund.id}`}>
            <div key={fund.id} className="bg-gradient-to-r from-white to-[#fcfcfc] h-[180px] flex flex-col items-center justify-center text-gray-500 rounded-lg shadow-lg m-[2vh] hover:bg-gradient-to-r hover:from-white hover:to-gray-100 hover:text-secondary-color transition duration-600 ease-in-out">
                <h2 className="text-xl font-bold text-secondary-color">{fund.name}</h2>
                <p className="text-fs mt-2">{fund.description}</p>
                <div className="grid grid-cols-3 space-x-4 mt-4 w-[80%]">
                    <div className="">
                        <p className='text-xl text-black font-bold'>{formatToUSD(113355678)}</p>
                        <p>TVL</p>
                    </div>
                    <div className="">
                        <p className='text-xl text-black font-bold'>100</p>
                        <p>Investors</p>
                    </div>
                    <div className="fl">
                        <div className='flex flex-row items-center justify-center space-x-1'>
                            <p className={`text-xl font-bold ${rentValue > 0 ? 'text-green-500' : rentValue < 0 ? 'text-red-500' : 'text-black'}`}>
                                {formattedRent} 
                            </p>
                            {rentValue > 0 ? <AiOutlineArrowUp color="rgb(34 197 94)" size={20}/> : rentValue < 0 ? <AiOutlineArrowDown color="rgb(249 115 22)" size={20}/> : ''}
                        </div>
                        <p>Rent. 12m</p>
                    </div>
                </div>
            </div>
        </Link>
    ))

    const loadingElements = Array(4).fill(null).map((_, index) => (
        <div key={index} className="bg-gradient-to-r from-white to-[#f6f6f6] h-[180px] opacity-80 flex items-center justify-center text-gray-500 rounded-lg shadow-lg m-[2vh]">
        </div>
    ))

    const nullElements = Array(3).fill(null).map((_, index) => (
      <div key={index} className="mt-6 bg-gradient-to-r from-white to-[#f6f6f6] h-[180px] opacity-80 flex items-center justify-center text-gray-500 rounded-lg shadow-lg m-[2vh]">
        <p className='italic'>Connect your manager wallet to see your funds <br></br> or start creating a new one</p>
      </div>
    ))

    return (
        <>
            <div className='w-[100vw] h-screen text-gray-700 bg-[#fcfcfc] overflow-y-auto'>
                <section className="">
                    <div className="container mx-auto px-0 text-center py-12 md:px-6 lg:px-6">
                        <h2 className="mb-16 text-4xl font-bold text-center text-secondary-color">
                        Manager's Area
                        </h2>
                        <Link
                        className="bg-white text-black font-bold rounded-full border-2 border-transparent py-4 px-8 shadow-lg uppercase tracking-wider hover:bg-secondary-color hover:text-[white] hover:border-white transition duration-1000 ease-in-out" to="/create-fund"
                        >
                        Create Fund Now
                        </Link>
                        {!manager ? 
                          <div className='grid grid-cols-1 justify-center mb-12 mt-6 md:grid-cols-2 lg:grid-cols-3'>
                              {nullElements}
                          </div>
                          : 
                          <div>
                            <p className='text-xm mt-16 italic'>Please choose a hedge fund to manage and see stats</p>
                            <div className='grid grid-cols-1 justify-center mb-12 mt-6 cursor-pointer md:grid-cols-2 lg:grid-cols-3'>
                                {funds.length ? fundsElements : loadingElements }
                            </div>
                          </div>
                        }
                        {/* <div className='mb-24 mt-12 flex justify-center'>
                          <div className="w-96 px-20 py-3 text-xm font-bold bg-blue-color text-white hover:bg-slate-200 hover:text-secondary-color transition duration-1000 ease-in-out rounded-full uppercase cursor-pointer" onClick={() => setManager(1)}>
                          Connect Wallet
                          </div>
                        </div> */}
                    </div>
                </section>
                <Footer />
            </div>
        </>
    )
}