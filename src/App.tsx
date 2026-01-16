import './App.css'
import Introduction from './components/Introduction'
import ReplaceFirstFrame from './components/ReplaceFirstFrame'

const App = () => {
    return (
        <>
            <div className="flex justify-center w-full mt-12">
                <Introduction />
            </div>
            <div className="mt-20 flex justify-center">
                <ReplaceFirstFrame />
            </div>
        </>
    )
}

export default App
