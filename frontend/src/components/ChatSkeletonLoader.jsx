import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ChatSkeletonLoader = () => {
    return (
        <div>
            {Array(7).fill().map((_, index) => (
                <div key={index} className="flex mb-3 justify-between p-1">
                    <div className="flex gap-2">
                        <Skeleton circle height={40} width={40} />
                        <div className="">
                            <Skeleton height={20} width={100} />
                            <Skeleton height={10} width={200} />
                        </div>
                    </div>
                    <div className="">
                        <Skeleton circle height={20} width={20}/>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ChatSkeletonLoader