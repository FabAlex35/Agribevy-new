"use client"

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLoadScript } from '@react-google-maps/api';
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { registerUserAPI } from "@/src/Components/Api";
import { useRouter } from "next/navigation";
import Spinner from "@/src/Components/Spinner";
const libraries = ['places'];
export default function Register() {

  const { register, handleSubmit, watch, formState: { errors }, reset, control } = useForm()
  const [role, setRole] = useState("marketer")
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false)
  const market = useRef("")
  const [location, setLocation] = useState(null)
  const phonePattern = /^[0-9]{10}$/;
  const inputRef = useRef(null)
  const [errMsg, setErrMsg] = useState(null)
  // const password = watch("password", "");
  const router = useRouter()

  const registerUser = async (data) => {
    let payload
    setLoading(true)
    if (role === "marketer") {
      delete data?.location;
      payload = { ...data, role, market: market.current }
    }
    else {
      // delete data?.market;
      payload = { ...data, role, market: "" }
    }

    const response = await registerUserAPI(payload)
    
    if (response?.status === 200) {
      setLoading(false)
      if (role === "marketer") {
        router.push("/portal/settings")
      }
      else{
        router.push("/portal/dashboard")
      }

      // router.push('/')
    }
    else if (response?.status === 409) {
      setLoading(false)
      setErrMsg(response?.message)
      setTimeout(() => {
        setErrMsg(null)
      }, 2000)
    }

  }

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBlIiFCk_dzh5-xKpyfFwbux0veNE-w_RI',
    libraries,
  });

  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         console.log(position.coords);
  //         const { latitude, longitude } = position.coords
  //         try {
  //           const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},
  //           ${longitude}&key=AIzaSyBlIiFCk_dzh5-xKpyfFwbux0veNE-w_RI`)
  //           const data=await response.json()
  //           // setLocation(data.results[0].formatted_address)
  //           reset({
  //             location:data.results[0].formatted_address
  //           })
  //         }
  //         catch (err) {
  //           console.log(err);

  //         }
  //       },
  //     );
  //   } else {
  //     console.log("Geolocation not supported");
  //   }
  //   console.log(isLoaded);

  // }, []);

  useEffect(() => {

    if (isLoaded && inputRef.current) {
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(8.0892, 76.8463), // Southwest corner
        new google.maps.LatLng(13.6890, 80.2785)  // Northeast corner
      );

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment'], // Restrict results to places
        componentRestrictions: { country: 'IN' }, // Restrict to a specific country, if needed
      });

      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        market.current = place.name
      })
    }
  }, [isLoaded]);

  const change = (e) => {
    setRole(e.target.value)

  }

  return (
    <main>
      <div className="bg-login d-flex align-items-center">
        <div className="col-12 d-flex flex-wrap justify-content-center reg-row ">
          <div className="col-12 col-lg-7 d-flex justify-content-center align-items-center">
            <div>
              <h1 className="primary-color heading-login">AgriBevy</h1>
              <h3 className="mt-2 mt-lg-3 mb-3 mb-lg-0 primary-color sub-heading-login">Harvesting Opportunities, Connecting Communities...</h3>
            </div>
          </div>

          <div className=" col-12 col-md-8 col-lg-5" >
            <div className="login-card bg-white col-12 col-md-10 m-auto">
              <h2 className="text-center primary-color">Registration</h2>
              <div className="form-login">
                <form onSubmit={handleSubmit(registerUser)}>
                  <div className="form-group mb-0">
                    <label className="radio-inline" htmlFor="marketer">
                      <input type="radio" name="optradio" id="marketer" value="marketer" defaultChecked onChange={change} />&nbsp;&nbsp;Marketer
                    </label>
                    <label className="radio-inline2 ms-3" htmlFor="buyer">
                      <input type="radio" name="optradio" id="buyer" value="buyer" onChange={change} />&nbsp;&nbsp;Buyer
                    </label>
                    <label className="radio-inline2 ms-3" htmlFor="farmer">
                      <input type="radio" name="optradio" id="farmer" value="farmer" onChange={change} />&nbsp;&nbsp;Farmer

                    </label>
                  </div>
                  <div className="d-flex gap-3">
                    <div className="form-group" >
                      <label htmlFor="name">{role === "marketer" ? "Shop name" : "Name"}</label>
                      <input type="text" className="form-control" id="name"
                        {...register("name", {
                          required: `Please enter the ${role === "marketer" ? "Shop name" : "Name"}`
                        })} />
                      <p className="err-dev">{errors.name?.message}</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="mobile">Mobile</label>
                      <input type="number" className="form-control" onInput={(e) => {
                        if (e.target.value.length > 10) {
                          e.target.value = e.target.value.slice(0, 10)
                        }
                      }} onWheel={(e) => e.target.blur()} {...register("mobile", {
                        required: "Please enter the Mobile number",
                        pattern: {
                          value: phonePattern,
                          message: "Enter valid mobile number",
                        },
                      })} />
                      <p className="err-dev">{errors.mobile?.message}</p>
                    </div>
                  </div>
                  <div className="form-group showpass">
                    <label htmlFor="pwd">Password</label>
                    <input type={show ? "text" : "password"} className="form-control" id="pwd" {...register("password", {
                      required: "Please enter the Password"
                    })} />
                    {show ? (
                      <VscEyeClosed
                        className="eye2"
                        onClick={() => setShow(false)}
                      />
                    ) : (<VscEye className="eye2" onClick={() => setShow(true)} />)}
                    <p className="err-dev">{errors.password?.message}</p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="con_pwd">Confirm Password</label>
                    <input type="password" className="form-control" id="con_pwd" {...register("cpassword", {
                      required: "Please reenter the Password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })} />
                    <p className="err-dev">{errors.cpassword?.message}</p>
                  </div>
                  {role === "marketer" &&
                    <div className="form-group">
                      <label htmlFor="market">Market</label>
                      {/* <input type="text" className="form-control" id="email" ref={(e)=>{
                      inputRef.current=e;
                      field.ref(e)
                    }} {...register("market", {
                      required: "Please enter the Market"
                    })} /> */}
                      <Controller
                        name="market"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              {...register("market", {
                                required: "Please enter the Market",
                                onChange: (e) => market.current = e.target.value
                              })}
                              {...field}
                              ref={(e) => {
                                inputRef.current = e;
                                field.ref(e);
                              }}
                              type="text"
                              className="form-control"
                              placeholder=""
                              value={market.current}

                            />
                          </>
                        )}
                      />
                      <p className="err-dev">{errors.market?.message}</p>
                    </div>}
                  {role !== "marketer" &&
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input type="text" className="form-control" id="location" {...register("address", {
                        required: "Please enter the Location",
                        // onChange:(e)=>setLocation(e.target.value)
                      })} />
                      <p className="err-dev">{errors.address?.message}</p>
                    </div>}

                  {role === "marketer" &&
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input type="text" className="form-control" id="address" {...register("address", {
                        required: "Please enter the Address",
                      })} />
                      <p className="err-dev">{errors.address?.message}</p>
                    </div>}

                  <div className="err-div">
                    <div className="d-flex justify-content-center mb-2">
                      <button type="submit" className="mt-4 px-3 py-1 submit-btn">
                        {loading ? <Spinner /> :
                          "Submit"}
                      </button>
                    </div >
                    {errMsg && <p className="err-message">{errMsg}</p>}
                  </div>


                  <div className="pt-2 mt-3   text-center">Already have an account ? <Link href="/" className="primary-color login-link">Login</Link></div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>


    </main>
  );
}
