"use client"

import { useEffect, useRef, useState } from "react"
import Badge from "../../components/ui/badge/Badge"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { addProduct, createTab, removeProduct, removeTab, setCustomerDetails, updateProduct } from "./posSlice"
import { Modal } from "../../components/ui/modal"

interface Product {
  productID: string;
  title: string;
  description: string;
  price: number;
  vat: number;
  discount: number;
  quantity: number;
  notes: string;
}

export default function POSInterface() {
  const [activeCategory, setActiveCategory] = useState("upper")
  const [currentAmount, setCurrentAmount] = useState("")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isTabCreated, setIsTabCreated] = useState(false);
  const isTabCreatedRef = useRef(false); // Ref to track initialization
  const tabs = useAppSelector(state => state.pos.tabs);
  const [selectedTab, setSelectedTab] = useState('1');
  const [selectedProduct, setSelectedProduct] = useState<Product>()
  const [currentNote, setCurrentNote] = useState('')
  const [showNotesPopup, setShowNotesPopup] = useState(false)
  const [activeProduct, setActiveProduct] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentManagedKey, setCurrentManagedKey] = useState('Price');
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const dispatch = useAppDispatch();

  const categories = [
    { id: "upper", name: "Upper body", active: true },
    { id: "lower", name: "Lower body", active: false },
    { id: "others", name: "Others", active: false },
  ]

  const products = [
    {
      id: 1,
      name: "Black embroidered t-shirt",
      price: 28.75,
      category: "upper",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 2,
      name: "Casual T-shirt",
      price: 25.99,
      category: "upper",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 3,
      name: "Classic Brown Jacket",
      price: 89.99,
      category: "upper",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 4,
      name: "Cozy Sweater",
      price: 45.99,
      category: "upper",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 5,
      name: "Crocheted Poncho Unisize",
      price: 38.5,
      category: "upper",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 6,
      name: "Jean Jacket",
      price: 65.99,
      category: "others",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 7,
      name: "Leather Jacket",
      price: 120.0,
      category: "others",
      image: "https://placehold.co/600x400/orange/white",
    },
    {
      id: 8,
      name: "T-shirt slim",
      price: 24.99,
      category: "others",
      image: "https://placehold.co/600x400/orange/white",
    },
  ]

  const handleNumberClick = (num: string) => {
    setCurrentAmount((prev) => prev + num)
  }

  const handleClear = () => {
    setCurrentAmount("")
  }

  const handleAddNotes = () => {
    if (activeProduct) {
        dispatch(updateProduct({tabId: selectedTab, productID: activeProduct, updates: {notes: currentNote}}))
    } else {
        dispatch(setCustomerDetails({tabId: selectedTab, customerId: selectedCustomer, notes: currentNote}))
    }
    setShowNotesPopup(false)
  }

  const handleSelectCutomer = (customer: string) => {
    let currentTab = tabs.find(tab => tab.id === selectedTab)?.cart
    if (currentTab) {
        setSelectedCustomer(customer)
        dispatch(setCustomerDetails({tabId: selectedTab, customerId: selectedCustomer, notes: currentTab?.notes || ''}))
    }
  }

    const handleRemoveProduct = (id: string, event: React.MouseEvent) => {
        event.stopPropagation() // Stop event from bubbling up
        dispatch(removeProduct({tabId: selectedTab, productID: id}))
        setActiveProduct('')
    }
  const handleShowNotesPopUp = () => {
    if (activeProduct) {
        let currentProduct = tabs.find(tab => tab.id === selectedTab)?.cart.products.find(prod => prod.productID === activeProduct)

        if (currentProduct) {
            setCurrentNote(currentProduct.notes)
        }
    } else {
        setCurrentNote(tabs.find(tab => tab.id === selectedTab)?.cart?.notes || '')
    }
    setShowNotesPopup(true)
  }
const handleRemoveTab = (id: string) => {
    if (tabs.length > 1) {
        const currentTabIndex = tabs.findIndex(tab => tab.id === id);
        
        // First, determine which tab to select next
        let nextTabId;
        if (currentTabIndex === tabs.length - 1) {
            nextTabId = tabs[currentTabIndex - 1].id;
        } else {
            nextTabId = tabs[currentTabIndex + 1].id;
        }
        
        // If we're removing the currently selected tab, update selection first
        if (id === selectedTab) {
            setSelectedTab(nextTabId);
        }
        
        // Then remove the tab
        dispatch(removeTab(id));
    }
}
useEffect(() => {
    // If the selected tab no longer exists, select the last available tab
    if (tabs.length > 0 && !tabs.find(tab => tab.id === selectedTab)) {
        setSelectedTab(tabs[tabs.length - 1].id);
    }
}, [tabs, selectedTab]);
  const handleShowAddProductPopUp = (product: Product) => {
    setSelectedProduct(product)
    setShowAddProductModal(true)
  }

  const handleSetManagedKey = (key: string) => {
    if (key === 'Price' || key === '%' || key === 'Qty') {
        setCurrentManagedKey(key)
        setCurrentAmount('')
    }
  }
  const handleAddProduct = (product: Product) => {
    setCurrentAmount('')
    let currentProduct = tabs.find(tab => tab.id === selectedTab)?.cart.products.find(prod => prod.productID === product.productID)
    if (currentProduct) {
        dispatch(updateProduct({tabId: selectedTab, productID: product.productID, updates: {quantity: currentProduct.quantity + 1}}))
    } else {
        dispatch(addProduct({tabId: selectedTab, product: product}))
    }
    setShowAddProductModal(false)
  }

  const handleSetActiveProduct = (productID: string) => {
    if (activeProduct !== productID) {
        setCurrentAmount('')
        setActiveProduct(productID)
    } else {
        setActiveProduct('')
    }
  }

  useEffect(() => {
    if (!isTabCreatedRef.current) {
      const tabExists = tabs.some(tab => tab.id === '1');
      
      if (!tabExists) {
        console.log("Creating tab"); // Debugging line
        isTabCreatedRef.current = true;
        setIsTabCreated(true);
        dispatch(createTab({ id: '1', customerId: '' }));
      }
    }
  }, [dispatch, tabs]);

  useEffect(() => {
    console.log(tabs);
    
  }, [tabs])

  useEffect(() => {
    if (currentAmount && activeProduct)
        switch (currentManagedKey) {
            case 'Price':
                    dispatch(updateProduct({tabId: selectedTab, productID: activeProduct, updates: {price: Number(currentAmount)}}))
                break;
            case 'Qty':
                    dispatch(updateProduct({tabId: selectedTab, productID: activeProduct, updates: {quantity: parseInt(currentAmount)}}))
                break;
        
            case '%':
                    dispatch(updateProduct({tabId: selectedTab, productID: activeProduct, updates: {discount: Number(currentAmount)}}))
                break;
        
            default:
                break;
        }
  }, [currentAmount, activeProduct])
  
useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only process keyboard input if there's an active product
      if (!activeProduct) return;

      // Handle numbers and decimal point
      if (/^[0-9.]$/.test(event.key)) {
        handleNumberClick(event.key);
      }
      // Handle backspace
      else if (event.key === 'Backspace') {
        handleClear();
      }
      // Handle shortcuts for different modes
      else if (event.key === 'p' || event.key === 'P') {
        handleSetManagedKey('Price');
      }
      else if (event.key === 'q' || event.key === 'Q') {
        handleSetManagedKey('Qty');
      }
      else if (event.key === 'd') {
        handleSetManagedKey('%');
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeProduct]); // Depend on activeProduct to properly handle enable/disable

return (
    <div className={isFullScreen ? "full-screen" : ""}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* tabs */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
            <div className="flex flex-wrap align-center gap-2 justify-start">
                {
                    tabs.map((tab, index) => (
                        (
                            selectedTab === tab.id ? (
                                <button key={tab.id} onClick={() => {setSelectedTab(tab.id);setActiveProduct('');setCurrentAmount('')}} id="badge-dismiss-default" className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-sm dark:bg-blue-900 dark:text-blue-300 cursor-pointer">
                                    Tab {tab.id}
                                    <button onClick={() => handleRemoveTab(tab.id) } type="button" className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-xs hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300" data-dismiss-target="#badge-dismiss-default" aria-label="Remove">
                                    <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                        <span className="sr-only">Remove badge</span>
                                    </button>
                                </button>
                            ) : (
                                <button key={tab.id} onClick={() => {setSelectedTab(tab.id);setActiveProduct('');setCurrentAmount('')}} id="badge-dismiss-dark" className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-sm dark:bg-gray-700 dark:text-gray-300 cursor-pointer">
                                    Tab {tab.id}
                                    <button type="button" onClick={() => handleRemoveTab(tab.id)} className="inline-flex items-center p-1 ms-2 text-sm text-gray-400 bg-transparent rounded-xs hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-gray-300" data-dismiss-target="#badge-dismiss-dark" aria-label="Remove">
                                    <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                        <span className="sr-only">Remove badge</span>
                                    </button>
                                </button>
                            )
                        )
                    ))
                }
                <button type="button" onClick={() => dispatch(createTab({ id: String(parseInt(tabs[tabs.length - 1].id) + 1), customerId: '' }))} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">    
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="15" height="15" stroke-width="2">
                    <path d="M12 5l0 14"></path>
                    <path d="M5 12l14 0"></path>
                    </svg>
                </button>
            </div>
            <button onClick={() => setIsFullScreen(!isFullScreen)}>
                {
                    isFullScreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2"> <path d="M5 9l4 0l0 -4"></path> <path d="M3 3l6 6"></path> <path d="M5 15l4 0l0 4"></path> <path d="M3 21l6 -6"></path> <path d="M19 9l-4 0l0 -4"></path> <path d="M15 9l6 -6"></path> <path d="M19 15l-4 0l0 4"></path> <path d="M15 15l6 6"></path> </svg> 
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
                        <path d="M16 4l4 0l0 4"></path>
                        <path d="M14 10l6 -6"></path>
                        <path d="M8 20l-4 0l0 -4"></path>
                        <path d="M4 20l6 -6"></path>
                        <path d="M16 20l4 0l0 -4"></path>
                        <path d="M14 14l6 6"></path>
                        <path d="M8 4l-4 0l0 4"></path>
                        <path d="M4 4l6 6"></path>
                        </svg>
                    )
                }
            </button>
        </div>
        <div className="flex max-[1100px]:flex-col gap-8">
        {/* Products Section */}
          <div className="flex-1">
            {/* Categories */}
            <div className="flex space-x-4 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg max-[767px]:text-xs ${
                    activeCategory === category.id ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.filter(prod => prod.category === activeCategory).map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleShowAddProductPopUp({
                    productID: (product.id).toString(),
                    title: product.name,
                    description: "",
                    price: product.price,
                    vat: 0.14 * product.price,
                    discount: 0,
                    quantity: 1,
                    notes: ""
                  })}
                >
                  <div className="aspect-square relative mb-2">
                    <img src={product.image} alt={product.name} className="object-cover rounded h-full" />
                    <span onClick={() => {setShowInfoModal(true);setShowAddProductModal(false)}} className="rounded-[50px] p-[2px] bg-gray-100 absolute top-[5px] right-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                        <path d="M12 9h.01"></path>
                        <path d="M11 12h1v4h1"></path>
                        </svg>
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.price} EGP</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Numpad Section */}
          <div className="bg-white flex flex-col rounded-lg shadow p-4 min-w-[380px] max-[767px]:min-w-full">
            {/* cart wrapper */}
            <div className="min-h-[420px] flex flex-col flex-1 justify-between">
                {/* cart body */}
                <div className="flex-1 flex flex-col max-h-[300px] overflow-y-auto justify-start items-center">
                    {
                        tabs.find(tab => tab.id === selectedTab)?.cart.products.length === 0 ? (
                            <div className="min-h-[300px] flex justify-center items-center flex-col">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 w-[50px] h-[50px]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                                <p className="text-center mt-3">Start adding products</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex-col justify-start items-center w-full min-h-[300px]">
                                {
                                    tabs.find(tab => tab.id === selectedTab)?.cart.products.map((product, index) => (
                                            <button
                                                key={product.productID} // Always add a unique key to avoid React issues
                                                className={`flex justify-between items-start gap-4 relative w-full mb-2 border rounded p-3 cursor-pointer text-left 
                                                    ${activeProduct === product.productID ? 'border-green-400' : ''}`}
                                                onClick={() => {
                                                    handleSetActiveProduct(product.productID);
                                                }}
                                            >
                                            <h2 className="text-dark px-2 bg-gray-100 rounded mt-2">{index + 1}</h2>
                                            <div className="flex-1">
                                                <p className="text-sm text-left">{product.quantity} x {product.title}</p>
                                                <p className="text-xs mt-1 text-left">
                                                    {
                                                        product.discount ? (                                                            
                                                            <span>
                                                                {((Number(product.discount) / 100) * Number(product.price)).toFixed(2)} EGP with {(product.discount.toFixed(2))}% discount
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                No Discount
                                                            </span>
                                                        )
                                                    }
                                                </p>
                                                <div className="flex justify-start items-center gap-2 mt-3">
                                                    {
                                                        product.notes && (
                                                            <Badge color="light" size="sm">
                                                                {product.notes}
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <h2 className="text-md font-bold text-blue-600">{((product.quantity * product.price) - ((Number(product.discount) / 100) * Number(product.price) * product.quantity)).toFixed(2)} EGP</h2>
                                                <span onClick={(e) => handleRemoveProduct(product.productID, e)} className="absolute bottom-2 right-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8a0c0c" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
                                                <path d="M10 10l4 4m0 -4l-4 4"></path>
                                                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
                                                </svg>
                                            </span>
                                        </button>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>
                {/* Order Summary */}
                    <div className="mb-4 p-4 border-b border-t mt-4">
                        {
                            tabs.find(tab => tab.id === selectedTab)?.cart.notes && (
                                <div className="flex justify-between mb-2 gap-2 border-b pb-2">
                                    <span className="text-gray-600">Notes: </span>
                                    <span className="font-xs max-w-[250px]">
                                        {tabs.find(tab => tab.id === selectedTab)?.cart.notes}
                                    </span>
                                </div>
                            )
                        }
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Taxes</span>
                            <span className="font-medium">
                                {(
                                    0.14 *
                                    Number(
                                        tabs
                                            .find(tab => tab.id === selectedTab)
                                            ?.cart.products.reduce(
                                                (sum, product) => 
                                                    sum + 
                                                    (product.price * product.quantity * (1 - product.discount / 100)), 
                                                0
                                            )
                                    )
                                ).toFixed(2)} EGP
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>
                                {tabs
                                    .find(tab => tab.id === selectedTab)
                                    ?.cart.products.reduce(
                                        (sum, product) => 
                                            sum + 
                                            (product.price * product.quantity * (1 - product.discount / 100)), 
                                        0
                                    )
                                    .toFixed(2)} EGP
                            </span>
                        </div>
                    </div>
                    {
                        activeProduct && (
                            <>

                                {/* Display */}
                                <div className="bg-gray-100 p-4 mb-4 rounded">
                                <span className="text-2xl font-mono">{currentAmount || "0.00"}</span>
                                </div>

                                {/* Numpad Grid */}
                                <div className="grid grid-cols-4 gap-2">
                                {[7, 8, 9, "Price", 4, 5, 6, "%", 1, 2, 3, "Qty", "+/-", 0, ".", "⌫"].map((btn, index) => (
                                    <button
                                    key={index}
                                    onClick={() =>
                                        typeof btn === "number" || btn === "."
                                        ? handleNumberClick(btn.toString())
                                        : btn === "⌫"
                                            ? handleClear()
                                            : handleSetManagedKey(btn.toString())
                                    }
                                    className={`p-3 text-center rounded ${
                                        typeof btn === "number" || btn === "." || btn === "⌫"
                                        ? "bg-gray-100 hover:bg-gray-200"
                                        : btn === currentManagedKey
                                            ? "bg-blue-200 hover:bg-gray-300"
                                            : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                                    >
                                    {btn}
                                    </button>
                                ))}
                                </div>
                            </>
                        )
                    }
                    <div>
                        <div className="flex justify-between items-center mt-4">
                            <select value={selectedCustomer} onChange={(e) => handleSelectCutomer(e.target.value)} 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[200]  max-[767px]:w-[140px] me-2 mb-2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value="">Customer --</option>
                                <option value="1">Ahmed - 01550552370</option>
                                <option value="2">kareem - 01550552370</option>
                            </select>
                            <button type="button" onClick={() => {handleShowNotesPopUp()}} className="min-w-[100px] text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Note</button>
                        </div>

                        {/* Payment Button */}
                        <button className="w-full mt-2 p-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors">
                        Payment
                        </button>
                    </div>
            </div>
          </div>
        </div>
      </div>
      {
        selectedProduct && (
            <Modal
                isOpen={showAddProductModal}
                onClose={() => setShowAddProductModal(false)}
                showCloseButton
                isFullscreen={false}
                className="max-w-[400px] p-4"
            >
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {selectedProduct?.title}
                        </h3>
                    </div>
                    <div className="p-4 md:p-5 space-y-4">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Choose product features
                        </p>
                    </div>
                    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => {handleAddProduct(selectedProduct)}}>Add</button>
                        <button data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" onClick={() => {
                            setShowAddProductModal(false);
                        }}>Cancel</button>
                    </div>
            </Modal>
        )
      }
      {
        showNotesPopup && (
            <Modal
                isOpen={showNotesPopup}
                onClose={() => setShowNotesPopup(false)}
                showCloseButton
                isFullscreen={false}
                className="max-w-[400px] p-4"
            >
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Notes
                        </h3>
                    </div>
                    <div className="p-4 md:p-5 space-y-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes</label>
                        <textarea id="message" rows={4} value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."></textarea>
                    </div>
                    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => {handleAddNotes()}}>Add</button>
                        <button data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" onClick={() => {
                            setShowNotesPopup(false);
                        }}>Cancel</button>
                    </div>
            </Modal>
        )
      }
      {
        showInfoModal && (
            <Modal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                showCloseButton
                isFullscreen={false}
                className="max-w-[400px] p-4"
            >
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Static modal
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            <div className="p-4 md:p-5 space-y-4">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                </p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
                </p>
            </div>
            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button data-modal-hide="static-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => {
                            setShowInfoModal(false);setShowAddProductModal(false)
                        }}>Ok </button>
            </div>
            </Modal>
        )
      }
    </div>
  )
}

