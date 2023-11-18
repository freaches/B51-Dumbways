class Testimonial {
    constructor(name, review, image) {
        this.name = name
        this.review = review
        this.image = image
    }

    html() {
        return `
            <div class="testimonial">
                <img src="${this.image}"/>
                <p class="quote">"${this.review}"</p>
                <p class="author">- ${this.name}</p>
            </div>
        `
    }
}

const testimonial1 = new Testimonial("Bunga", 
"Hidup terasa menyenangkan karena City", 
"https://images.pexels.com/photos/762041/pexels-photo-762041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")
const testimonial2 = new Testimonial("Yoga", 
"Mulai harimu dengan menghina MU", 
"https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")
const testimonial3 = new Testimonial("Lulu",
 "Hidup saya berwana karena Yura Yunatid lebih banyak trophy daripada MU", 
 "https://images.pexels.com/photos/789822/pexels-photo-789822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")

const testimonials = [testimonial1, testimonial2, testimonial3]

let testimonialHTML = ``
for(let index = 0; index < testimonials.length; index++) {
    testimonialHTML += testimonials[index].html()
}

document.getElementById("list-testimonial").innerHTML = testimonialHTML