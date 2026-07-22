function addLighting(scene) {
    scene.add(new THREE.AmbientLight(0xf5f0e8, 0.58));

    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(3, 4, 5);
    scene.add(key);

    const rim = new THREE.PointLight(0xf4a0b8, 1.05, 8);
    rim.position.set(-2.5, 1.25, -2.2);
    scene.add(rim);

    const under = new THREE.PointLight(0xf4a0b8, 0.75, 5);
    under.position.set(0, -1.8, 1.1);
    scene.add(under);

    const grid = new THREE.GridHelper(8, 20, 0xf5f0e8, 0x242424);
    grid.position.y = -1.18;
    scene.add(grid);
}

function createParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 300;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
        const radius = 1.8 + Math.random() * 2.7;
        const angle = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    return new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.026,
        color: 0xf4a0b8,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.68
    }));
}
