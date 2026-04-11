import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Package, Search, Loader2, Download, Camera, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const API_BASE = "http://localhost:8080/api/products";

function App() {
  const [activeTab, setActiveTab] = useState('verify');
  const [formData, setFormData] = useState({ id: '', name: '', manufacturer: '' });
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRegistered, setLastRegistered] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  // --- SCANNER LOGIC ---
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      });

      scanner.render((decodedText) => {
        setSearchId(decodedText);
        setShowScanner(false);
        scanner.clear();
        // Auto-verify after scan
        handleVerify(decodedText);
      }, (error) => {
        // Silent error for scanning frames
      });

      return () => scanner.clear();
    }
  }, [showScanner]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastRegistered(null);
    try {
      const res = await axios.post(`${API_BASE}/add`, {
        productId: formData.id,
        name: formData.name,
        manufacturer: formData.manufacturer
      });
      setLastRegistered(res.data);
      setFormData({ id: '', name: '', manufacturer: '' });
    } catch (err) {
      alert("Registration failed. Check if Blockchain Node is running.");
    }
    setLoading(false);
  };

  const handleVerify = async (idToSearch = searchId) => {
    if (!idToSearch) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/verify/${idToSearch}`);
      setResult(res.data);
    } catch (err) {
      setResult({ isAuthentic: false, message: 'Counterfeit or Unregistered Product!' });
    }
    setLoading(false);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${lastRegistered.productId}_QR.png`;
    downloadLink.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <div className="flex justify-center mb-2 text-blue-600"><ShieldCheck size={50} /></div>
        <h1 className="text-4xl font-black tracking-tight">BLOCKVERIFY</h1>
        <p className="text-slate-500 font-medium">Securing Global Supply Chains with Blockchain</p>
      </header>

      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex bg-slate-100 p-2 gap-2">
          <button onClick={() => {setActiveTab('verify'); setResult(null);}} className={`flex-1 py-3 rounded-2xl font-bold transition ${activeTab === 'verify' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>Verify</button>
          <button onClick={() => {setActiveTab('add'); setLastRegistered(null);}} className={`flex-1 py-3 rounded-2xl font-bold transition ${activeTab === 'add' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>Register</button>
        </div>

        <div className="p-8">
          {activeTab === 'verify' ? (
            <div className="space-y-6">
              {showScanner ? (
                <div className="relative">
                  <div id="reader" className="overflow-hidden rounded-2xl border-2 border-blue-500"></div>
                  <button onClick={() => setShowScanner(false)} className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg"><X size={20}/></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input className="flex-1 border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 transition" placeholder="Enter Serial #..." value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                  <button onClick={() => setShowScanner(true)} className="bg-slate-100 text-slate-700 px-4 rounded-2xl hover:bg-slate-200"><Camera size={24} /></button>
                  <button onClick={() => handleVerify()} className="bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 font-bold">{loading ? <Loader2 className="animate-spin" /> : <Search />}</button>
                </div>
              )}

              {result && (
                <div className={`p-6 rounded-3xl border-4 animate-in zoom-in duration-300 ${result.isAuthentic ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                  <div className="flex flex-col items-center text-center gap-3">
                    {result.isAuthentic ? <ShieldCheck size={64} className="text-green-600" /> : <ShieldAlert size={64} className="text-red-600" />}
                    <div>
                      <h2 className={`text-2xl font-black ${result.isAuthentic ? 'text-green-800' : 'text-red-800'}`}>{result.isAuthentic ? 'VERIFIED AUTHENTIC' : 'WARNING: FAKE'}</h2>
                      {result.isAuthentic && (
                        <div className="mt-2 space-y-1">
                          <p className="font-bold text-slate-800 text-lg">{result.modelName}</p>
                          <p className="text-slate-500 text-sm">Manufacturer: {result.manufacturer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manufacturer Form remains mostly the same as previous step */
            <div className="space-y-6">
               {!lastRegistered ? (
                 <form onSubmit={handleAdd} className="space-y-4">
                    <input className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl" placeholder="Product Serial Number" required value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
                    <input className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl" placeholder="Product Model" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    <input className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl" placeholder="Manufacturer Name" required value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} />
                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black hover:bg-slate-800 transition shadow-xl">SECURE ON BLOCKCHAIN</button>
                 </form>
               ) : (
                 <div className="text-center space-y-6">
                    <div className="inline-block p-4 bg-white rounded-3xl border-2 border-slate-100 shadow-inner">
                      <QRCodeCanvas id="qr-gen" value={lastRegistered.productId} size={180} level={"H"} includeMargin={true} />
                    </div>
                    <p className="text-blue-600 font-black text-xl">REGISTRATION COMPLETE</p>
                    <button onClick={downloadQRCode} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2"><Download size={20}/> Save Product QR Code</button>
                    <button onClick={() => setLastRegistered(null)} className="text-slate-400 font-bold hover:text-slate-600">Register Another</button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;