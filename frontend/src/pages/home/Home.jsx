import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
	return (
		<div className='lg:flex lg:flex-row md:flex md:flex-col sm:flex sm:overflow-scroll overflow-scroll lg:overflow-hidden md:overflow-hidden sm:flex-col flex flex-col sm:h-[450px] md:h-[550px] rounded-lg  bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
			<Sidebar />
			<MessageContainer />
		</div>
	);
};
export default Home;
