/**
 * Products Data File
 * 
 * Este archivo simula nuestra base de datos.
 * Exportamos la lista de manera global para que `main.js` y `cart.js` puedan leerla.
 */

const products = [
    {
        id: 1,
        name: "Vestido Lino Arena",
        category: "ropa",
        price: 85000,
        image: "images/beige_linen_dress.png",
        description: "Vestido fluido de lino en color arena. Perfecto para días cálidos y atardeceres de verano.",
        sizes: ["S", "M", "L"]
    },
    {
        id: 2,
        name: "Vestido Seda Blanco",
        category: "ropa",
        price: 95000,
        image: "images/white_silk_dress.png",
        description: "Elegante vestido de seda blanca con caída suave. Ideal para ocasiones especiales.",
        sizes: ["S", "M"]
    },
    {
        id: 3,
        name: "Bolso Trenzado Mimbre",
        category: "accesorios",
        price: 45000,
        image: "images/wicker_bag.png",
        description: "Bolso de mimbre artesanal con detalles en cuero vegetal. Un clásico atemporal.",
        sizes: [] // Empty array means no size needed
    },
    {
        id: 4,
        name: "Sombrero Verano Ribón",
        category: "accesorios",
        price: 32000,
        image: "images/summer_hat.png",
        description: "Sombrero de ala ancha con textura fina y cinta acentuadora. Protección con estilo.",
        sizes: ["Único"]
    }
];

// Función de ayuda para formatear precios a moneda local.
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(price);
}
