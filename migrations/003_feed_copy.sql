update feed_posts
set content = 'El área está abierta. Empieza por la bienvenida y sigue el orden: preparación, ritual, activación y señales. En cada clase, la guía en español está delante; la clase original sigue disponible en la otra pestaña. Ningún paso promete que alguien vuelva. Sirve para ordenar tu intención y tu manera de actuar.'
where id = 'feed-bienvenida';

update feed_posts
set content = 'Los baños de hierbas, el ritual de protección y la práctica de la noche están en Inicio, como bonus. Léelos como cuidado simbólico: no dirigen la voluntad de otra persona. La carta y el pedido del ritual personal abren una página fuera de esta área. Antes de compartir datos o de pagar, lee qué te prometen.'
where id = 'feed-bonus';
