import React, { useEffect } from "react";
import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./style.css"
import logo from "./Assets/Group 39.svg"
import rectangle from "./Assets/Rectangle 6382.png"

const App = () => {
  const [scanResult, setScanResult] = useState(null)
  const [jsonData, setJsonData] = useState(null)
  const [scannerActive, setScannerActive] = useState(false)
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox : {
        width : "100%",
        height : "100%"
      },
      fps : 5
    })
    if(scannerActive){
      scanner.render(success, error)
    } 
  
      async function success(result) {
        scanner.clear();
        setScanResult(result)
        const parsedData = JSON.parse(result);
        console.log("c'est le parsed data ", parsedData)
        setJsonData(parsedData)
        console.log("c'est le json Data ", jsonData)
        setScannerActive(false)
        console.log("voici bocy ", JSON.stringify(parsedData))
        try{
          const response = await fetch("http://localhost:1000", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Définir l'en-tête Content-Type
            },
            body: JSON.stringify(parsedData)
          });
    
          const data = await response.json();
          console.log("Réponse du back: ", data);
        }catch (error) {
          console.log("erreur lors du link ", error)
        } 
      }
  
    function error(err) {
      console.warn(err)
    }

    return () => scanner.clear()
  }, [scannerActive])

  const startScanner = () => {
    setScannerActive(true);
    setScanResult(null)
  };
 

    return(
        <div className="main">
            <div className="scanSide">
              <div className = "scanner" id="reader" style={{backgroundColor: scannerActive ? "transparent" : "#8DA7C3"}}></div>
              <button className = "scanButton" onClick={startScanner}>SCAN</button>
            </div>
            <div className="textSide">
                <img className="logo" src={logo} alt = "logo"/>
                {
                  scanResult && jsonData
                  ?
                  <div className="results">
                    <p className="champ">{jsonData.fullName}</p>
                    <img className="rectangle" src={rectangle} alt = "rectangle"/>
                    <p className="champ">{jsonData.email}</p>
                    <img className="rectangle" src={rectangle} alt = "rectangle"/>
                    <p className="champ">{jsonData.team}</p>
                    <img className="rectangle" src={rectangle} alt = "rectangle"/>
                  </div>
                  :
                  <p className="title">CLICK ON THE BUTTTON TO SCAN</p>
                }
            </div>  
        </div>
    );
}

export default App;
