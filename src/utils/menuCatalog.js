const MENU_CATALOG_STORAGE_KEY = "menuCatalog";

export const menuCategories = ["coffee", "drinks", "appetizers", "food"];

export const defaultMenuData = {
    coffee: [
        {
            id: 1,
            name: "Espresso",
            price: 2.5,
            image:
                "https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG",
            noteOptions: ["Χωρίς σημείωση", "Με ζάχαρη", "Χωρίς ζάχαρη", "Μέτριο"],
        },
        {
            id: 2,
            name: "Freddo Espresso",
            price: 3.0,
            image:
                "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με ζάχαρη", "Χωρίς ζάχαρη", "Extra πάγο"],
        },
        {
            id: 7,
            name: "Cappuccino",
            price: 3.3,
            image:
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με κανέλα", "Με κακάο", "Χωρίς ζάχαρη"],
        },
        {
            id: 8,
            name: "Freddo Cappuccino",
            price: 3.8,
            image:
                "https://images.unsplash.com/photo-1494314671902-399b18174975?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Γλυκό", "Μέτριο", "Χωρίς αφρόγαλα"],
        },
        {
            id: 9,
            name: "Latte",
            price: 3.9,
            image:
                "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με φυτικό γάλα", "Χωρίς ζάχαρη", "Extra shot"],
        },
        {
            id: 10,
            name: "Americano",
            price: 2.8,
            image:
                "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με ζάχαρη", "Χωρίς ζάχαρη", "Πιο δυνατό"],
        },
        {
            id: 11,
            name: "Μοχά",
            price: 4.1,
            image:
                "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra σοκολάτα", "Χωρίς σαντιγί", "Χωρίς ζάχαρη"],
        },
        {
            id: 12,
            name: "Ελληνικός",
            price: 2.2,
            image:
                "https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Σκέτος", "Μέτριος", "Γλυκός"],
        },
    ],
    drinks: [
        {
            id: 3,
            name: "Πορτοκαλάδα",
            price: 2.0,
            image:
                "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς πάγο", "Extra πάγο", "Χωρίς ανθρακικό"],
        },
        {
            id: 4,
            name: "Λεμονάδα",
            price: 2.0,
            image:
                "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς πάγο", "Extra πάγο", "Λιγότερο γλυκό"],
        },
        {
            id: 13,
            name: "Coca-Cola",
            price: 2.3,
            image:
                "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με λεμόνι", "Χωρίς πάγο", "Zero"],
        },
        {
            id: 14,
            name: "Σόδα",
            price: 2.0,
            image:
                "https://images.unsplash.com/photo-1610873167013-2dd675d30ef4?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με λεμόνι", "Χωρίς πάγο", "Extra κρύα"],
        },
        {
            id: 15,
            name: "Tonic",
            price: 2.4,
            image:
                "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με αγγούρι", "Με λεμόνι", "Χωρίς πάγο"],
        },
        {
            id: 16,
            name: "Iced Tea Ροδάκινο",
            price: 2.6,
            image:
                "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς πάγο", "Extra πάγο", "Λιγότερο γλυκό"],
        },
        {
            id: 17,
            name: "Νερό 500ml",
            price: 0.8,
            image:
                "https://images.unsplash.com/photo-1564419433223-645dcf7c3f4d?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Δροσερό", "Σε θερμοκρασία δωματίου"],
        },
        {
            id: 18,
            name: "Milkshake Βανίλια",
            price: 4.2,
            image:
                "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς σαντιγί", "Extra σιρόπι", "Χωρίς ζάχαρη"],
        },
    ],
    appetizers: [
        {
            id: 25,
            name: "Nachos με Σάλτσα",
            price: 5.2,
            image:
                "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra salsa", "Χωρίς jalapeno", "Extra τυρί"],
        },
        {
            id: 26,
            name: "Πατάτες Τηγανητές",
            price: 4.0,
            image:
                "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Με ρίγανη", "Extra αλάτι", "Με cheddar"],
        },
        {
            id: 27,
            name: "Onion Rings",
            price: 4.6,
            image:
                "https://images.unsplash.com/photo-1639024471283-03518883512d?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra sauce", "Χωρίς sauce", "Καλοτηγανισμένα"],
        },
        {
            id: 28,
            name: "Mini Bruschetta",
            price: 5.4,
            image:
                "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra ντομάτα", "Χωρίς σκόρδο", "Extra βασιλικό"],
        },
        {
            id: 29,
            name: "Ποικιλία Τυριών",
            price: 7.8,
            image:
                "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra crackers", "Χωρίς blue cheese", "Με μέλι"],
        },
        {
            id: 30,
            name: "Chicken Bites",
            price: 6.2,
            image:
                "https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Spicy", "Mild", "Extra dip"],
        },
        {
            id: 31,
            name: "Spring Rolls",
            price: 5.0,
            image:
                "https://images.unsplash.com/photo-1601315379734-425a469078de?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra sweet chili", "Χωρίς sauce", "Καλοτηγανισμένα"],
        },
        {
            id: 32,
            name: "Mini Pizza Bites",
            price: 5.8,
            image:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra τυρί", "Χωρίς ελιές", "Spicy"],
        },
    ],
    food: [
        {
            id: 5,
            name: "Club Sandwich",
            price: 6.5,
            image:
                "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς πατάτες", "Extra sauce", "Καλοψημένο"],
        },
        {
            id: 6,
            name: "Burger",
            price: 7.5,
            image:
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Καλοψημένο", "Χωρίς κρεμμύδι", "Extra τυρί"],
        },
        {
            id: 19,
            name: "Τοστ Ζαμπόν-Τυρί",
            price: 3.4,
            image:
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς βούτυρο", "Extra τυρί", "Καλοψημένο"],
        },
        {
            id: 20,
            name: "Ομελέτα",
            price: 5.2,
            image:
                "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς αλάτι", "Extra τυρί", "Καλοψημένη"],
        },
        {
            id: 21,
            name: "Caesar Salad",
            price: 6.0,
            image:
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Χωρίς κρουτόν", "Extra parmesan", "Χωρίς dressing"],
        },
        {
            id: 22,
            name: "Μακαρονάδα Ναπολιτέν",
            price: 7.2,
            image:
                "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Al dente", "Extra τυρί", "Χωρίς σκόρδο"],
        },
        {
            id: 23,
            name: "Πίτσα Μαργαρίτα",
            price: 8.5,
            image:
                "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra τυρί", "Λιγότερη σάλτσα", "Καλοψημένη"],
        },
        {
            id: 24,
            name: "Cheesecake",
            price: 4.8,
            image:
                "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900&auto=format&fit=crop",
            noteOptions: ["Χωρίς σημείωση", "Extra σιρόπι", "Χωρίς σιρόπι", "Με παγωτό"],
        },
    ],
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

export function getMenuData() {
    const fromStorage = localStorage.getItem(MENU_CATALOG_STORAGE_KEY);

    if (!fromStorage) {
        return deepClone(defaultMenuData);
    }

    try {
        const parsed = JSON.parse(fromStorage);
        const merged = {};

        menuCategories.forEach((category) => {
            if (Array.isArray(parsed[category])) {
                merged[category] = parsed[category];
                return;
            }

            merged[category] = deepClone(defaultMenuData[category] || []);
        });

        return merged;
    } catch {
        return deepClone(defaultMenuData);
    }
}

export function saveMenuData(menuData) {
    localStorage.setItem(MENU_CATALOG_STORAGE_KEY, JSON.stringify(menuData));
}

function normalizeNoteOptions(noteOptions) {
    const cleanNoteOptions = (noteOptions || [])
        .map((note) => note.trim())
        .filter(Boolean);

    if (!cleanNoteOptions.includes("Χωρίς σημείωση")) {
        cleanNoteOptions.unshift("Χωρίς σημείωση");
    }

    return cleanNoteOptions;
}

export function addProductToCategory(category, productData) {
    const menuData = getMenuData();
    const allProducts = Object.values(menuData).flat();
    const maxId = allProducts.reduce((maxValue, product) => {
        return Math.max(maxValue, Number(product.id) || 0);
    }, 0);

    const cleanNoteOptions = normalizeNoteOptions(productData.noteOptions);

    const newProduct = {
        id: maxId + 1,
        name: productData.name.trim(),
        price: Number(productData.price),
        image: productData.image.trim(),
        noteOptions: cleanNoteOptions,
    };

    menuData[category] = [...(menuData[category] || []), newProduct];
    saveMenuData(menuData);

    return menuData;
}

export function updateProductInCategory(category, productId, productData) {
    const menuData = getMenuData();
    const cleanNoteOptions = normalizeNoteOptions(productData.noteOptions);

    menuData[category] = (menuData[category] || []).map((product) => {
        if (product.id !== productId) {
            return product;
        }

        return {
            ...product,
            name: productData.name.trim(),
            price: Number(productData.price),
            image: productData.image.trim(),
            noteOptions: cleanNoteOptions,
        };
    });

    saveMenuData(menuData);

    return menuData;
}

export function deleteProductFromCategory(category, productId) {
    const menuData = getMenuData();

    menuData[category] = (menuData[category] || []).filter(
        (product) => product.id !== productId
    );

    saveMenuData(menuData);

    return menuData;
}
