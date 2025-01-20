import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Canvas, useThree } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three"; // THREEをインポート
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useState, Suspense } from "react";

const Loading = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-16 h-16 border-8 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
    </div>
);

export default function Home() {
    const [isDaytime, setIsDaytime] = useState(true);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cameraPosition, setCameraPosition] = useState([0.5, 10, 22]);

    useEffect(() => {
        // スクロールバーを非表示にするために body のスタイルを設定
        document.body.style.overflow = "hidden";

        // 現在の時間を取得して背景色を設定
        const currentHour = new Date().getHours();
        setIsDaytime(currentHour >= 6 && currentHour < 18);

        // ウィンドウの幅に応じてカメラの位置を調整
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCameraPosition([0.5, 10, 30]); // スマホバージョンのときにカメラを引く
            } else {
                setCameraPosition([0.5, 10, 22]); // デフォルトのカメラ位置
            }
        };

        // 初期設定とリサイズイベントリスナーの追加
        handleResize();
        window.addEventListener("resize", handleResize);

        // Three.jsのレンダラーを作成
        const renderer = new THREE.WebGLRenderer();

        // モデルの事前読み込み
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(
            "https://www.gstatic.com/draco/v1/decoders/"
        );
        loader.setDRACOLoader(dracoLoader);

        loader.load(
            "rabbit-room-compressed.glb",
            (gltf) => {
                console.log("Model loaded successfully", gltf);
                setModel(gltf);
                setLoading(false);
            },
            undefined,
            (error) => {
                console.error("Error loading model:", error);
                setLoading(false);
            }
        );

        return () => {
            // コンポーネントがアンマウントされたときに元に戻す
            document.body.style.overflow = "auto";
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="ホーム画面" />
            <div
                style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
            >
                {loading && <Loading />}
                <Canvas
                    camera={{
                        position: cameraPosition, // カメラの位置を状態から取得
                        fov: 50, // 視野角を少し広げて、全体が見えるように調整
                    }}
                    style={{
                        background: isDaytime ? "#FFF5E1" : "black", // 時間帯に応じた背景色を設定
                        width: "100%",
                        height: "100%",
                        display: loading ? "none" : "block",
                    }}
                >
                    <Suspense fallback={<Loading />}>
                        {model && <Scene isDaytime={isDaytime} model={model} />}
                    </Suspense>
                </Canvas>
            </div>
        </AuthenticatedLayout>
    );
}

function Scene({ isDaytime, model }) {
    return (
        <>
            {/* 照明の設定 */}
            <ambientLight intensity={1.6} /> {/* 環境光 */}
            <directionalLight position={[5, 10, 5]} intensity={1.6} />{" "}
            {/* 平行光源 */}
            <spotLight
                position={[10, 15, 10]}
                intensity={2.0} // 光の強度を調整
                angle={0.3} // 照射角度を調整
                penumbra={1} // 半影の範囲を調整
                castShadow
            />{" "}
            {/* スポットライト */}
            {/* モデルの配置 */}
            <primitive
                object={model.scene}
                position={[-16, -8, 0]} // モデルを左に移動し、少し下に移動
                rotation={[-0.005, Math.PI / 10, 0]} // 視点に合わせて軽く回転し、少し上向きに調整
                scale={[2, 2, 2]} // モデルサイズを調整
            />
            {/* カメラコントロール */}
            <OrbitControls
                enablePan={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2.5} // 視点が崩れないように制限
                target={[0, 4, 0]} // カメラがモデルの中心に向くように設定
                maxAzimuthAngle={Math.PI / 4} // カメラの水平回転の最大角度を設定
                minAzimuthAngle={-Math.PI / 4} // カメラの水平回転の最小角度を設定
            />
            {/* 星空の追加 */}
            {!isDaytime && (
                <Stars radius={100} depth={50} count={5000} factor={6} fade />
            )}
        </>
    );
}
