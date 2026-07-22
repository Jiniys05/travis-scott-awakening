function tuneTexture(texture, renderer) {
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 8;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

function createPlaneMaterial(texture) {
    return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        alphaTest: 0.015,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide
    });
}

function createDepthMaterial(texture, color = 0x3e2723) {
    return new THREE.MeshBasicMaterial({
        map: texture,
        color,
        transparent: true,
        opacity: 0,
        alphaTest: 0.015,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide
    });
}

function setPlaneSize(mesh, texture, width) {
    const aspect = texture.image.width / texture.image.height;
    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(width, width / aspect, 1, 1);
}

function createHologramRings() {
    const group = new THREE.Group();
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xf4a0b8,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    for (let i = 0; i < 3; i += 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35 + i * 0.38, 0.01, 8, 96), ringMaterial.clone());
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.88 + i * 0.12;
        ring.material.opacity = 0.5 - i * 0.12;
        group.add(ring);
    }

    const glow = new THREE.Mesh(
        new THREE.CircleGeometry(2.55, 96),
        new THREE.MeshBasicMaterial({
            color: 0xf4a0b8,
            transparent: true,
            opacity: 0.13,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.94;
    group.add(glow);

    return group;
}

function normalizeAngle(angle) {
    const twoPi = Math.PI * 2;
    return ((angle % twoPi) + twoPi) % twoPi;
}

function circularDistance(a, b) {
    const twoPi = Math.PI * 2;
    const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, twoPi - diff);
}

function viewWeights(angle, tilt = 0) {
    const views = [
        { name: "sideA", angle: 0 },
        { name: "front", angle: Math.PI * 0.5 },
        { name: "sideB", angle: Math.PI },
        { name: "rear", angle: Math.PI * 1.5 }
    ];
    let nearest = views[0];
    let nearestDistance = circularDistance(angle, nearest.angle);

    views.forEach((view) => {
        const distance = circularDistance(angle, view.angle);
        if (distance < nearestDistance) {
            nearest = view;
            nearestDistance = distance;
        }
    });

    const raw = { [nearest.name]: 1 };

    if (tilt < -0.44) {
        return { top: 1 };
    }

    return raw;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function createJordan1Low(renderer) {
    const shoe = new THREE.Group();
    const loader = new THREE.TextureLoader();
    const planes = {};
    window.__hologramTexturesLoaded = 0;
    document.documentElement.dataset.hologramTextures = "0";

    const assets = {
        sideA: { url: "assets/hf-side-a.png", width: 3.12, y: -0.03, x: 0, z: 0.03 },
        front: { url: "assets/hf-front.png", width: 2.05, y: -0.02, x: 0, z: 0.045 },
        sideB: { url: "assets/hf-side-b.png", width: 3.12, y: -0.03, x: 0, z: 0.03 },
        rear: { url: "assets/hf-rear.png?v=no-hole-hard", width: 1.72, y: 0.02, x: 0, z: 0.035 },
        top: { url: "assets/hf-top.png", width: 2.1, y: 0.05, x: 0, z: 0.055 }
    };

    Object.entries(assets).forEach(([name, asset], index) => {
        loader.load(asset.url, (texture) => {
            window.__hologramTexturesLoaded += 1;
            document.documentElement.dataset.hologramTextures = String(window.__hologramTexturesLoaded);
            tuneTexture(texture, renderer);
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(asset.width, 1, 1, 1), createPlaneMaterial(texture));
            setPlaneSize(plane, texture, asset.width);
            plane.position.set(asset.x, asset.y, asset.z + 0.004 * index);
            plane.renderOrder = 20 + index;

            const depthPlane = new THREE.Mesh(new THREE.PlaneGeometry(asset.width, 1, 1, 1), createDepthMaterial(texture));
            setPlaneSize(depthPlane, texture, asset.width);
            depthPlane.position.set(asset.x + 0.055, asset.y - 0.045, asset.z - 0.09 + 0.004 * index);
            depthPlane.scale.set(1.018, 1.018, 1);
            depthPlane.renderOrder = 10 + index;

            planes[name] = { plane, depthPlane, asset };
            shoe.add(depthPlane);
            shoe.add(plane);
        });
    });

    shoe.add(createHologramRings());

    shoe.userData.setHologramPulse = (elapsed, angle = 0, tilt = 0) => {
        const weights = viewWeights(angle, tilt);
        const scanPulse = 0.94 + Math.sin(elapsed * 2.6) * 0.06;
        Object.entries(planes).forEach(([name, entry]) => {
            const targetOpacity = weights[name] || 0;
            const currentOpacity = entry.plane.material.opacity;
            const opacityRate = targetOpacity > currentOpacity ? 0.34 : 0.42;
            const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * opacityRate;
            const activeLift = targetOpacity * 0.018;

            entry.plane.material.opacity = targetOpacity ? Math.max(0.92, Math.min(1, nextOpacity * scanPulse)) : Math.max(0, nextOpacity);
            entry.depthPlane.material.opacity += ((targetOpacity * 0.34) - entry.depthPlane.material.opacity) * 0.18;
            entry.plane.position.x = entry.asset.x + Math.sin(angle + entry.asset.z * 8) * targetOpacity * 0.026;
            entry.plane.position.y = entry.asset.y + Math.sin(elapsed * 1.7) * 0.012 + activeLift;
            entry.depthPlane.position.x = entry.plane.position.x + 0.058;
            entry.depthPlane.position.y = entry.plane.position.y - 0.048;
            entry.plane.scale.setScalar(1 + targetOpacity * 0.022);
            entry.depthPlane.scale.setScalar(1.018 + targetOpacity * 0.018);
        });
    };

    shoe.rotation.set(-0.08, -0.42, 0);
    return shoe;
}
