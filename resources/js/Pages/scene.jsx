// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Head } from "@inertiajs/react";
// import { Canvas } from "@react-three/fiber";
// import { useLoader } from "@react-three/fiber";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { OrbitControls } from "@react-three/drei";
// import { useEffect } from "react";

// export default function Home() {
//     useEffect(() => {
//         // スクロールバーを非表示にするために body のスタイルを設定
//         document.body.style.overflow = "hidden";
//         return () => {
//             // コンポーネントがアンマウントされたときに元に戻す
//             document.body.style.overflow = "auto";
//         };
//     }, []);

//     return (
//         <AuthenticatedLayout>
//             <Head title="ホーム画面" />
//             <div
//                 style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
//             >
//                 <Canvas
//                     camera={{
//                         position: [0.5, 10, 22], // カメラをさらに後方に引いてモデル全体が見えるように配置
//                         fov: 50, // 視野角を少し広げて、全体が見えるように調整
//                     }}
//                     style={{
//                         background: "white",
//                         width: "100%",
//                         height: "100%",
//                     }} // 背景色を白に設定し、全画面表示
//                 >
//                     <Scene />
//                 </Canvas>
//             </div>
//         </AuthenticatedLayout>
//     );
// }

// function Scene() {
//     // GLTFLoader を使ってモデルを読み込む
//     const gltf = useLoader(GLTFLoader, "rabbit-house.glb");
//     return (
//         <>
//             <ambientLight intensity={1} /> {/* 照明の明るさを調整 */}
//             <directionalLight position={[5, 10, 5]} intensity={1.5} />{" "}
//             {/* 照明の明るさを調整 */}
//             <spotLight
//                 position={[10, 15, 10]}
//                 intensity={4}
//                 angle={0.5}
//                 penumbra={3}
//                 castShadow
//             />{" "}
//             {/* スポットライトを追加 */}
//             <primitive
//                 object={gltf.scene}
//                 position={[-16, -8, 0]} // モデルを左に移動し、少し下に移動
//                 rotation={[-0.005, Math.PI / 10, 0]} // 視点に合わせて軽く回転し、少し上向きに調整
//                 scale={[2, 2, 2]} // モデルサイズを調整
//             />
//             <OrbitControls
//                 enablePan={false}
//                 minPolarAngle={Math.PI / 3}
//                 maxPolarAngle={Math.PI / 2.5} // 視点が崩れないように制限
//                 target={[0, 4, 0]} // カメラがモデルの中心に向くように設定
//             />
//         </>
//     );
// }
